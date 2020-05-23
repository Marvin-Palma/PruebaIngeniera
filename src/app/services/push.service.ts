import { Injectable } from '@angular/core';

import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';

import { Storage } from '@ionic/storage';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] =[];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal,
              private storage: Storage) { 
  }

  async getMensajes(){
    this.mensajes = await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    this.oneSignal.startInit('c13ea8a7-1421-45b9-8396-f6e966587928', '332619177372');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
      // do something when notification is received
      console.log('Notificacion recibida', noti);
      this.notificacionRecibida(noti);
    });
    
    this.oneSignal.handleNotificationOpened().subscribe( async ( noti ) => {
      // do something when a notification is opened
      console.log('Notificacion abierta', noti);
      await this.notificacionRecibida(noti.notification);
      console.log("Termina proceso de Abierta");
    });

    // Obtener Id del subscriptor
    this.oneSignal.getIds().then(info=>{
      this.userId=info.userId;
      console.log(this.userId);
    });
    // Fin Obtener Id del subscriptor
    
    this.oneSignal.endInit();
  }

  async notificacionRecibida( noti: OSNotification ){

    console.log('Entra a notificacionRecibida');

    await this.cargarMensajes();

    console.log(' Post cargaMensajes asjdkjfsdjf');
    
    const payload = noti.payload;

    const existePush = this.mensajes.find(mensaje =>mensaje.notificationID === payload.notificationID);

    if(existePush){
      return;
    }

    this.mensajes.unshift(payload);

    this.pushListener.emit(payload);

    await this.guardarMensajes();


  }

  async guardarMensajes(){

    console.log('Entra a guardarMensajes');

    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes(){
    console.log('Entra a cargarMensajes');
    //Si no hay mensajes devolverá un valor null por eso se usa el operador || para devolver una cadena vacía []
    this.mensajes = await this.storage.get('mensajes') || [];

    console.log('Post cargarMensajesLocalData');

    return this.mensajes;
  }

  async borrarMensajes(){
    // Limpia todo el storage 
    // this.storage.clear();
    // Limpiar sección en específico 
    await this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardarMensajes();
  }
}
