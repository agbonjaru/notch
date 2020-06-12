import { Injectable } from '@angular/core';
// import jwt from 'jsonwebtoken';

import { GeneralService } from '../services/general.service';

@Injectable({
  providedIn: 'root',
})

export class TokenVerification {
  secretOrPrivateKey = 'passkey';

  constructor(private genSer: GeneralService) {}

  verifyToken(token) {
    return true;
    // return jwt.verify(token, this.secretOrPrivateKey, (error, decoded) => {
    //   if (error) {
    //     this.genSer.expiredToken.next(error);
    //     return false;
    //   }
    //   if (Object.keys(decoded).length !== 6) {
    //     return false;
    //   }
    //   this.genSer.expiredToken.next('');
    //   return true;
    // });
  }
}
