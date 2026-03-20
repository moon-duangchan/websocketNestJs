import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  roomId: string;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
