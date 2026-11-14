import { Capacitor } from '@capacitor/core';
import { NearbyMultipeer } from '@squareetlabs/capacitor-nearby-multipeer';

const SERVICE='lakec-carbon-field-v1';
const UUID='fa87c0d0-afac-11de-8a39-0800200c9a66';
let active=false, role='collector', endpoint=null, nameByEndpoint=new Map(), listeners=[];
const $=id=>document.getElementById(id);
function status(text){const el=$('nearbyStatus');if(el)el.textContent=text}
function deviceId(){let id=localStorage.getItem('lakec-nearby-device-id');if(!id){id=crypto.randomUUID();localStorage.setItem('lakec-nearby-device-id',id)}return id}
function collectorName(){return ($('nearbyName')?.value||$('operator')?.value||'Equipe de campo').trim()}
async function emit(type,detail={}){if(!endpoint)return;await NearbyMultipeer.sendMessage({endpointId:endpoint,data:JSON.stringify({type,...detail})})}
async function sendRecord(record){if(!active||role!=='collector'||!endpoint||record.nearbyRelay||record.nearbyDeliveredAt)return;try{await emit('RECORD',{record,sourceDeviceId:deviceId(),sourceName:collectorName()});status('Réplica enviada. Aguardando confirmação do aparelho da coordenação…')}catch(e){status('Falha no envio ao aparelho próximo: '+(e?.message||e))}}
window.lakecNearbyQueue=sendRecord;
window.lakecReceiveNearbyRecord=async(record,sourceDeviceId,sourceName)=>{
  if(!record?.id)throw Error('Registro recebido sem identificador.');
  const copy={...record,id:'relay_'+String(record.id).replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+String(sourceDeviceId||'celular').replace(/[^a-zA-Z0-9_-]/g,'_'),sourceRecordId:record.id,nearbyRelay:{sourceDeviceId,sourceName,receivedAt:new Date().toISOString()}};
  await window.lakecStoreNearbyRecord(copy);
  if(navigator.onLine&&window.lakecSyncPending)window.lakecSyncPending();
  return copy.id;
};
async function flush(){
 if(role!=='collector'||!endpoint)return;
 const rows=await window.lakecGetPending?.()||[];
 for(const r of rows) await sendRecord(r);
}
function installListeners(){
 if(listeners.length)return;
 listeners.push(NearbyMultipeer.addListener('endpointFound',async e=>{
   if(role!=='collector'||!String(e.endpointName||'').startsWith('LAKE-C-COORD:'))return;
   endpoint=e.endpointId;nameByEndpoint.set(endpoint,e.endpointName);
   status('Coordenação encontrada: '+e.endpointName.replace('LAKE-C-COORD:','')+'. Conectando…');
   try{await NearbyMultipeer.connect({endpointId:endpoint,displayName:'LAKE-C-COLETOR:'+collectorName()})}catch(err){status('Não conectou: '+(err?.message||err))}
 }));
 listeners.push(NearbyMultipeer.addListener('connectionRequested',async e=>{
   if(role!=='coordinator'){await NearbyMultipeer.rejectConnection({endpointId:e.endpointId});return}
   const peer=String(e.endpointName||'Celular LAKE-C');
   if(!peer.startsWith('LAKE-C-COLETOR:')){await NearbyMultipeer.rejectConnection({endpointId:e.endpointId});return}
   if(!confirm('Aceitar conexão de campo de '+peer.replace('LAKE-C-COLETOR:','')+'?')){await NearbyMultipeer.rejectConnection({endpointId:e.endpointId});return}
   endpoint=e.endpointId;nameByEndpoint.set(endpoint,peer);
   await NearbyMultipeer.acceptConnection({endpointId:endpoint});
   status('Celular autorizado: '+peer.replace('LAKE-C-COLETOR:','')+'. Aguardando réplicas…');
 }));
 listeners.push(NearbyMultipeer.addListener('connectionResult',async e=>{
   if(Number(e.status)===0){endpoint=e.endpointId;status('Conectado ao aparelho próximo. Réplicas salvas serão transferidas automaticamente.');if(role==='collector')await flush()}
   else {endpoint=null;status('A conexão falhou. Mantenha os apps abertos e tente novamente.')}
 }));
 listeners.push(NearbyMultipeer.addListener('message',async e=>{
   try{
    const m=JSON.parse(e.data||'{}');
    if(m.type==='RECORD'&&role==='coordinator'){
      const sourceName=String(m.sourceName||nameByEndpoint.get(e.endpointId)||'Equipe de campo');
      const id=await window.lakecReceiveNearbyRecord(m.record,m.sourceDeviceId,sourceName);
      await NearbyMultipeer.sendMessage({endpointId:e.endpointId,data:JSON.stringify({type:'ACK',recordId:m.record.id})});
      status('Réplica recebida de '+sourceName+' e salva neste aparelho.');
    } else if(m.type==='ACK'&&role==='collector'){
      await window.lakecMarkNearbyDelivered?.(m.recordId);
      status('Coordenação confirmou o recebimento da réplica.');
    }
   }catch(err){status('Mensagem não processada: '+(err?.message||err))}
 }));
 listeners.push(NearbyMultipeer.addListener('endpointLost',e=>{
   if(endpoint===e.endpointId){endpoint=null;status('Conexão interrompida. As réplicas continuam salvas neste aparelho.')}
 }));
}
async function start(){
 if(!Capacitor.isNativePlatform()){status('A transferência Bluetooth requer o app LAKE-C instalado; o site continua funcionando para coleta e backup.');return}
 if(active)return;
 role=$('nearbyRole').value;
 try{
   await installListeners();
   await NearbyMultipeer.initialize({serviceId:SERVICE,serviceUUIDString:UUID});
   await NearbyMultipeer.setStrategy({strategy:'P2P_STAR'});
   if(role==='coordinator'){
     await NearbyMultipeer.startAdvertising({displayName:'LAKE-C-COORD:'+collectorName()});
     status('Coordenação visível. Aguarde o coletor e confirme a conexão.');
   }else{
     await NearbyMultipeer.startDiscovery();
     status('Procurando o aparelho da coordenação por Bluetooth/BLE…');
   }
   active=true;$('nearbyStart').disabled=true;$('nearbyStop').disabled=false;$('nearbyRole').disabled=true;
 }catch(e){status('Não foi possível ativar Bluetooth: '+(e?.message||e)+'. Confira permissões do aparelho.')}
}
async function stop(){
 try{await NearbyMultipeer.stopAdvertising();await NearbyMultipeer.stopDiscovery();await NearbyMultipeer.disconnect()}catch{}
 active=false;endpoint=null;$('nearbyStart').disabled=false;$('nearbyStop').disabled=true;$('nearbyRole').disabled=false;status('Conexão de campo encerrada. Os dados continuam salvos localmente.');
}
function init(){
 const card=$('nearbyCard');if(!card)return;
 if(Capacitor.isNativePlatform()){card.classList.remove('hidden');status('Pronto para conexão Bluetooth. Autorize as permissões quando o Android solicitar.')}
 else {card.classList.remove('hidden');status('Bluetooth ao vivo é ativado na versão de aplicativo instalada; no site, use backup JSON ou compartilhamento de arquivo.')}
 $('nearbyStart').addEventListener('click',start);$('nearbyStop').addEventListener('click',stop);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&active&&role==='collector')flush()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
