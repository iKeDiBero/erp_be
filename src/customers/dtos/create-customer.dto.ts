import { IsBoolean, IsDecimal, IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCustomerDto {

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    personTypeId: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    documentTypeId: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    documentNumber: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(6)
    ubigeo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2)
    countryCode?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isWithHoldingAgent?: boolean;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    withHoldingRate?: number;


}