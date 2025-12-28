import { IsBoolean, IsDecimal, IsEmail,  IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {

    @IsNotEmpty()
    @IsNumber()
    @MaxLength(1)
    personTypeId: number;
    
    @IsNotEmpty()
    @IsNumber()
    @MaxLength(1)
    documentTypeId: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    documentNumber: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @MaxLength(255)
    address?: string;

    @IsString()
    @MaxLength(6)
    ubigeo?: string;

    @IsString()
    @MaxLength(2)
    countryCode?: string;

    @IsEmail()
    @IsString()
    @MaxLength(150)
    email?: string;

    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsBoolean()
    isWithHoldingAgent?: boolean;

    @IsDecimal({ force_decimal: false, decimal_digits: '5,2' })
    withHoldingRate?: number;

    
}