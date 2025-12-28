import { Expose, Transform } from 'class-transformer';

export class DocumentTypeResponseDto {

    @Expose()
    id: number;

    @Expose()
    code: string;

    @Expose()
    description: string;

    @Expose()
    sunatCode: string;

    @Expose()
    @Transform(({ value }) => (value === 1 || value === '1' || value === true), { toClassOnly: true })
    isActive: boolean | null;
    
}