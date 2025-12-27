export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string
                    created_at: string
                    entity_id: string | null
                    entity_type: string
                    id: string
                    ip_address: string | null
                    new_values: Json | null
                    old_values: Json | null
                    user_agent: string | null
                    user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string
                    entity_id?: string | null
                    entity_type: string
                    id?: string
                    ip_address?: string | null
                    new_values?: Json | null
                    old_values?: Json | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string
                    entity_id?: string | null
                    entity_type?: string
                    id?: string
                    ip_address?: string | null
                    new_values?: Json | null
                    old_values?: Json | null
                    user_agent?: string | null
                    user_id?: string | null
                }
            }
            buildings: {
                Row: {
                    address: string
                    city: string
                    created_at: string
                    created_by: string | null
                    id: string
                    is_active: boolean
                    name: string
                    pincode: string
                    state: string
                    total_floors: number
                    updated_at: string
                }
                Insert: {
                    address: string
                    city: string
                    created_at?: string
                    created_by?: string | null
                    id?: string
                    is_active?: boolean
                    name: string
                    pincode: string
                    state: string
                    total_floors: number
                    updated_at?: string
                }
                Update: {
                    address?: string
                    city?: string
                    created_at?: string
                    created_by?: string | null
                    id?: string
                    is_active?: boolean
                    name?: string
                    pincode?: string
                    state?: string
                    total_floors?: number
                    updated_at?: string
                }
            }
            complaints: {
                Row: {
                    assigned_to: string | null
                    category: string
                    created_at: string
                    description: string
                    id: string
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    resolution_notes: string | null
                    resolved_at: string | null
                    room_id: string
                    status: 'open' | 'in_progress' | 'resolved' | 'closed'
                    tenant_id: string
                    title: string
                    updated_at: string
                }
                Insert: {
                    assigned_to?: string | null
                    category: string
                    created_at?: string
                    description: string
                    id?: string
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    resolution_notes?: string | null
                    resolved_at?: string | null
                    room_id: string
                    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
                    tenant_id: string
                    title: string
                    updated_at?: string
                }
                Update: {
                    assigned_to?: string | null
                    category?: string
                    created_at?: string
                    description?: string
                    id?: string
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    resolution_notes?: string | null
                    resolved_at?: string | null
                    room_id?: string
                    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
                    tenant_id?: string
                    title?: string
                    updated_at?: string
                }
            }
            floors: {
                Row: {
                    building_id: string
                    created_at: string
                    floor_number: number
                    id: string
                    total_rooms: number
                    updated_at: string
                }
                Insert: {
                    building_id: string
                    created_at?: string
                    floor_number: number
                    id?: string
                    total_rooms: number
                    updated_at?: string
                }
                Update: {
                    building_id?: string
                    created_at?: string
                    floor_number?: number
                    id?: string
                    total_rooms?: number
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    created_at: string
                    email_sent: boolean
                    id: string
                    in_app_read: boolean
                    message: string
                    read_at: string | null
                    related_complaint_id: string | null
                    related_payment_id: string | null
                    sms_sent: boolean
                    status: 'pending' | 'sent' | 'failed' | 'read'
                    title: string
                    type: 'payment_reminder' | 'payment_received' | 'complaint_update' | 'escalation_alert' | 'system_alert'
                    user_id: string
                    whatsapp_sent: boolean
                }
                Insert: {
                    created_at?: string
                    email_sent?: boolean
                    id?: string
                    in_app_read?: boolean
                    message: string
                    read_at?: string | null
                    related_complaint_id?: string | null
                    related_payment_id?: string | null
                    sms_sent?: boolean
                    status?: 'pending' | 'sent' | 'failed' | 'read'
                    title: string
                    type: 'payment_reminder' | 'payment_received' | 'complaint_update' | 'escalation_alert' | 'system_alert'
                    user_id: string
                    whatsapp_sent?: boolean
                }
                Update: {
                    created_at?: string
                    email_sent?: boolean
                    id?: string
                    in_app_read?: boolean
                    message?: string
                    read_at?: string | null
                    related_complaint_id?: string | null
                    related_payment_id?: string | null
                    sms_sent?: boolean
                    status?: 'pending' | 'sent' | 'failed' | 'read'
                    title?: string
                    type?: 'payment_reminder' | 'payment_received' | 'complaint_update' | 'escalation_alert' | 'system_alert'
                    user_id?: string
                    whatsapp_sent?: boolean
                }
            }
            payments: {
                Row: {
                    amount: number
                    created_at: string
                    id: string
                    is_verified: boolean
                    notes: string | null
                    payment_date: string
                    payment_mode: 'ONLINE_GATEWAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI_MANUAL'
                    razorpay_order_id: string | null
                    razorpay_payment_id: string | null
                    razorpay_signature: string | null
                    receipt_url: string | null
                    received_by: string | null
                    rent_cycle_id: string
                    tenant_id: string
                    updated_at: string
                    verified_at: string | null
                    verified_by: string | null
                }
                Insert: {
                    amount: number
                    created_at?: string
                    id?: string
                    is_verified?: boolean
                    notes?: string | null
                    payment_date?: string
                    payment_mode: 'ONLINE_GATEWAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI_MANUAL'
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    razorpay_signature?: string | null
                    receipt_url?: string | null
                    received_by?: string | null
                    rent_cycle_id: string
                    tenant_id: string
                    updated_at?: string
                    verified_at?: string | null
                    verified_by?: string | null
                }
                Update: {
                    amount?: number
                    created_at?: string
                    id?: string
                    is_verified?: boolean
                    notes?: string | null
                    payment_date?: string
                    payment_mode?: 'ONLINE_GATEWAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI_MANUAL'
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    razorpay_signature?: string | null
                    receipt_url?: string | null
                    received_by?: string | null
                    rent_cycle_id?: string
                    tenant_id?: string
                    updated_at?: string
                    verified_at?: string | null
                    verified_by?: string | null
                }
            }
            reminders: {
                Row: {
                    created_at: string
                    days_overdue: number
                    id: string
                    is_sent: boolean
                    reminder_date: string
                    rent_cycle_id: string
                    sent_at: string | null
                    tenant_id: string
                }
                Insert: {
                    created_at?: string
                    days_overdue?: number
                    id?: string
                    is_sent?: boolean
                    reminder_date: string
                    rent_cycle_id: string
                    sent_at?: string | null
                    tenant_id: string
                }
                Update: {
                    created_at?: string
                    days_overdue?: number
                    id?: string
                    is_sent?: boolean
                    reminder_date?: string
                    rent_cycle_id?: string
                    sent_at?: string | null
                    tenant_id?: string
                }
            }
            rent_cycles: {
                Row: {
                    amount_due: number
                    created_at: string
                    due_date: string
                    due_month: number
                    due_year: number
                    id: string
                    late_fee_amount: number | null
                    late_fee_applicable: boolean
                    late_fee_start_date: string | null
                    room_id: string
                    status: 'pending' | 'paid' | 'overdue' | 'waived'
                    tenant_id: string
                    updated_at: string
                }
                Insert: {
                    amount_due: number
                    created_at?: string
                    due_date: string
                    due_month: number
                    due_year: number
                    id?: string
                    late_fee_amount?: number | null
                    late_fee_applicable?: boolean
                    late_fee_start_date?: string | null
                    room_id: string
                    status?: 'pending' | 'paid' | 'overdue' | 'waived'
                    tenant_id: string
                    updated_at?: string
                }
                Update: {
                    amount_due?: number
                    created_at?: string
                    due_date?: string
                    due_month?: number
                    due_year?: number
                    id?: string
                    late_fee_amount?: number | null
                    late_fee_applicable?: boolean
                    late_fee_start_date?: string | null
                    room_id?: string
                    status?: 'pending' | 'paid' | 'overdue' | 'waived'
                    tenant_id?: string
                    updated_at?: string
                }
            }
            rooms: {
                Row: {
                    capacity: number
                    created_at: string
                    description: string | null
                    floor_id: string
                    id: string
                    is_active: boolean
                    monthly_rent: number
                    room_number: string
                    updated_at: string
                }
                Insert: {
                    capacity: number
                    created_at?: string
                    description?: string | null
                    floor_id: string
                    id?: string
                    is_active?: boolean
                    monthly_rent: number
                    room_number: string
                    updated_at?: string
                }
                Update: {
                    capacity?: number
                    created_at?: string
                    description?: string | null
                    floor_id?: string
                    id?: string
                    is_active?: boolean
                    monthly_rent?: number
                    room_number?: string
                    updated_at?: string
                }
            }
            security_deposits: {
                Row: {
                    amount: number
                    created_at: string
                    deduction_amount: number | null
                    deduction_reason: string | null
                    id: string
                    notes: string | null
                    payment_date: string
                    payment_mode: string
                    razorpay_order_id: string | null
                    razorpay_payment_id: string | null
                    received_by: string | null
                    refund_amount: number | null
                    refund_date: string | null
                    refunded_by: string | null
                    status: 'held' | 'refunded' | 'partially_refunded' | 'forfeited'
                    tenant_id: string
                    updated_at: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    deduction_amount?: number | null
                    deduction_reason?: string | null
                    id?: string
                    notes?: string | null
                    payment_date?: string
                    payment_mode: string
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    received_by?: string | null
                    refund_amount?: number | null
                    refund_date?: string | null
                    refunded_by?: string | null
                    status?: 'held' | 'refunded' | 'partially_refunded' | 'forfeited'
                    tenant_id: string
                    updated_at?: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    deduction_amount?: number | null
                    deduction_reason?: string | null
                    id?: string
                    notes?: string | null
                    payment_date?: string
                    payment_mode?: string
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    received_by?: string | null
                    refund_amount?: number | null
                    refund_date?: string | null
                    refunded_by?: string | null
                    status?: 'held' | 'refunded' | 'partially_refunded' | 'forfeited'
                    tenant_id?: string
                    updated_at?: string
                }
            }
            tenants: {
                Row: {
                    created_at: string
                    emergency_contact: string | null
                    id: string
                    id_proof_url: string | null
                    individual_rent: number
                    is_active: boolean
                    join_date: string
                    leave_date: string | null
                    room_id: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    emergency_contact?: string | null
                    id?: string
                    id_proof_url?: string | null
                    individual_rent: number
                    is_active?: boolean
                    join_date: string
                    leave_date?: string | null
                    room_id?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    emergency_contact?: string | null
                    id?: string
                    id_proof_url?: string | null
                    individual_rent?: number
                    is_active?: boolean
                    join_date?: string
                    leave_date?: string | null
                    room_id?: string | null
                    updated_at?: string
                    user_id?: string
                }
            }
            user_profiles: {
                Row: {
                    created_at: string
                    email: string
                    full_name: string
                    id: string
                    is_active: boolean
                    phone: string
                    role: 'admin' | 'tenant'
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    full_name: string
                    id: string
                    is_active?: boolean
                    phone: string
                    role: 'admin' | 'tenant'
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    full_name?: string
                    id?: string
                    is_active?: boolean
                    phone?: string
                    role?: 'admin' | 'tenant'
                    updated_at?: string
                }
            }
        }
        Views: {
            monthly_collection_summary: {
                Row: {
                    due_month: number | null
                    due_year: number | null
                    overdue_count: number | null
                    paid_count: number | null
                    pending_count: number | null
                    total_collected: number | null
                    total_expected: number | null
                    total_pending: number | null
                    total_rent_cycles: number | null
                }
            }
            room_status: {
                Row: {
                    building_name: string | null
                    capacity: number | null
                    current_tenants: number | null
                    floor_number: number | null
                    occupancy_status: string | null
                    rent_difference: number | null
                    room_id: string | null
                    room_number: string | null
                    total_individual_rent: number | null
                    total_room_rent: number | null
                }
            }
            tenant_dashboard: {
                Row: {
                    building_name: string | null
                    email: string | null
                    floor_number: number | null
                    full_name: string | null
                    individual_rent: number | null
                    join_date: string | null
                    open_complaints_count: number | null
                    pending_payments_count: number | null
                    phone: string | null
                    room_number: string | null
                    tenant_id: string | null
                    total_due_amount: number | null
                    user_id: string | null
                }
            }
        }
        Functions: {
            generate_monthly_rent_cycles: {
                Args: {
                    target_month: number
                    target_year: number
                }
                Returns: number
            }
            get_room_clearance_status: {
                Args: {
                    p_room_id: string
                    p_month: number
                    p_year: number
                }
                Returns: {
                    room_id: string
                    is_clear: boolean
                    total_expected: number
                    total_paid: number
                    total_pending: number
                }[]
            }
            update_overdue_status: {
                Args: Record<string, never>
                Returns: void
            }
        }
        Enums: {
            complaint_priority: 'low' | 'medium' | 'high' | 'urgent'
            complaint_status: 'open' | 'in_progress' | 'resolved' | 'closed'
            notification_status: 'pending' | 'sent' | 'failed' | 'read'
            notification_type: 'payment_reminder' | 'payment_received' | 'complaint_update' | 'escalation_alert' | 'system_alert'
            payment_mode: 'ONLINE_GATEWAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI_MANUAL'
        }
    }
}
