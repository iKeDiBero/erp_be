import { Expose } from 'class-transformer';

export class ResponseCustomerDto {

    @Expose()
    id: number;

    @Expose({name: 'person_type_id'})
    personTypeId: number;

    @Expose({name: 'document_type_id'})
    documentTypeId: number;

    @Expose({name: 'document_number'})
    documentNumber: string;

    @Expose()
    name: string;

    @Expose()
    address?: string;

    @Expose()
    ubigeo?: string;

    @Expose({name: 'country_code'})
    countryCode?: string;

    @Expose()
    email?: string;

    @Expose()
    phone?: string;

    @Expose({name: 'is_with_holding_agent'})
    isWithHoldingAgent?: boolean;

    @Expose({name: 'with_holding_rate'})
    withHoldingRate?: number;

    @Expose({name: 'is_active'})
    isActive: boolean;

    @Expose({name: 'created_at'})
    createdAt: Date;

    @Expose({name: 'updated_at'})
    updatedAt: Date;

}