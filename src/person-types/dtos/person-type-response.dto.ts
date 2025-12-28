import { Expose, Transform } from 'class-transformer';

export class PersonTypeResponseDto {

    @Expose()
    id: number;

    @Expose()
    code: string;

    @Expose()
    description: string;

    @Expose({ name: 'sunat_code' })
    sunatCode: string;

    @Expose({ name: 'is_active' })
    @Transform(({ value }) => (value === 1 || value === '1' || value === true), { toClassOnly: true })
    isActive: boolean | null;
    
}