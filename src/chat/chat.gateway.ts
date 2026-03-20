import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Server, Socket } from 'socket.io';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  // timer per client
  private idleTimers: Map<string, NodeJS.Timeout> = new Map();
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}
  //just for test
  //private activeRooms: string[]=[];

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.resetIdleTimer(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    this.clearIdleTimer(client.id);
  }

  private clearIdleTimer(clientId: string) {
    if (this.idleTimers.has(clientId)) {
      clearTimeout(this.idleTimers.get(clientId));
      this.idleTimers.delete(clientId);
    }
  }

  //setTimeout here

  private resetIdleTimer(client: Socket) {
    this.clearIdleTimer(client.id);
    const timer = setTimeout(() => {
      client.emit(`${client.id} timer out cuz Inactive`);
      client.disconnect();
    }, 20000);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    console.log(`[DEBUG] ${client.id} joined room: ${roomId}`);
    let oldMessages = await this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
    console.log(
      `[DEBUG] Found ${oldMessages.length} messages for room ${roomId}`,
    );
    const reversed = oldMessages.reverse();
    client.emit('loadOldMessages', reversed);
    client.emit('joinedRoom', roomId);
    return { success: true, roomId };
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sender: string; roomId: string; text: string },
  ) {
    this.logger.log(
      `Message in ${payload.roomId} from ${payload.sender}: ${payload.text}`,
    );
    this.resetIdleTimer(client);
    const newMessage = new this.messageModel({
      roomId: payload.roomId,
      sender: payload.sender,
      text: payload.text,
    });
    const saveMessage = await newMessage.save();
    this.server.to(payload.roomId).emit('chatToClient', saveMessage);
  }

  //sendMessage

  //@SubscribeMessage('sendMessage')
  //handleMessagendleMessage
  //(
  //@MessageBody() playload:string,
  //@ConnectedSocket() client:Socket
  //):void{
  // console.log(`Message From ${client.id}: ${playload}`);
  // this.server.emit('ReceiveMessage',playload);
  // this.server.emit(client.id, " Text : ",playload);

  // for 1 to 1 Message
  // return {event:'ReceiveMessage',data:playload};
  //}
}
