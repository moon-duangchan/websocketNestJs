import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './entities/room.entity';
@Injectable()
export class RoomService {
  
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}


   async create(createRoomDto: CreateRoomDto) {
    const createRoom= new this.roomModel(createRoomDto);
    return createRoom.save();
  }

  async findAll():Promise<Room[]> {
    return this.roomModel.find().exec();
  }

  async findOne(id: string):Promise<Room> {
    const room= await this.roomModel.findById(id).exec();
    if (!room)
    {
      throw new NotFoundException(`No room ID: ${id}`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto):Promise<Room> {
    const updateRoom = await this.roomModel
    .findByIdAndUpdate(id,updateRoomDto,{new:true}).exec();
    if (!updateRoom) {
      throw new NotFoundException(`No room ID: ${id}`);
    }
    return updateRoom;
  }

  async remove(id: string):Promise<{message:string}> {
    const deleteRoom = await this.roomModel.findByIdAndDelete(id).exec();
    if (!deleteRoom) {
      throw new NotFoundException(`Not found ${id}`);
    }
    return { message: `delete ID: ${id} wooooo` };
  }
}
