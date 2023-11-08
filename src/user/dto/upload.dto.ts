import { ApiProperty } from "@nestjs/swagger";

export class FileUploadDto {
    @ApiProperty()
    mo_ta: string

    @ApiProperty({ type: 'string', format: 'binary'}) 
    hinhAnh: any    
}                   
