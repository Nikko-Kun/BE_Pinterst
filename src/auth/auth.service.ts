import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { errorCode, failCode, successCode } from 'src/Config/response';
import { Response } from 'express';

import * as bcrypt from 'bcrypt';
import { UserSignInDto } from './dto/auth.dto';
import { UserSignUpType } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  model = new PrismaClient();


  // =============================================
  //                  ĐĂNG NHẬP
  // =============================================
  async signIn(body: UserSignInDto, res: Response) {
    try {
      let { email, mat_khau } = body;

      let checkEmail = await this.model.nguoi_dung.findFirst({
        where: {
          email,
        },
      });

      if (checkEmail) {
        
        let checkPass = bcrypt.compareSync(mat_khau, checkEmail.mat_khau);    
        if (checkPass == true) {
          
          let token = this.jwtService.sign({ data: checkEmail }, { expiresIn: '30d', secret: 'NODE' },); 
          successCode(res, token, 200, 'Login thành công !');
        } else {
          failCode(res, '', 400, 'Mật khẩu không đúng !');
        }
      } else {
        failCode(res, '', 400, 'Email không đúng hoặc chưa đăng ký !');
      }
    } catch (exception) {
      console.log('🚀 ~ file: auth.service.ts:46 ~ AuthService ~ signIn ~ exception:', exception,);
      errorCode(res, 'Lỗi BE');
    }
  }

  // =============================================
  //                  ĐĂNG KÝ
  // =============================================
  async signUp(body: UserSignUpType, res: Response) {
    try {
      let { email, mat_khau, ho_ten, tuoi, anh_dai_dien } = body;

      let checkEmail = await this.model.nguoi_dung.findFirst({
        where: {
          email,
        },
      });

      if (checkEmail !== null) {
        return failCode(res, '', 400, 'Email đã tồn tại !');
      }

      
      let newData = {
        email,
        mat_khau: await bcrypt.hash(mat_khau, 10), 
        ho_ten,
        tuoi,
        anh_dai_dien,
      };

      await this.model.nguoi_dung.create({
        data: newData,
      });

      successCode(res, newData, 201, 'Thêm mới thành công !');
    } catch (exception) {
      console.log("🚀 ~ file: auth.service.ts:83 ~ AuthService ~ signUp ~ exception:", exception)
      errorCode(res, 'Lỗi BE');
      
    }
  }
}