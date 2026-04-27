CREATE TABLE IF NOT EXISTS smartcampus.bookings (
    id bigint not null auto_increment,
    admin_reason TEXT,
    booking_date date not null,
    created_at datetime(6),
    end_time time(6) not null,
    expected_attendees integer,
    purpose TEXT,
    start_time time(6) not null,
    status enum ('PENDING','APPROVED','REJECTED','CANCELLED','CHECKED_IN') not null,
    updated_at datetime(6),
    resource_id bigint not null,
    user_id bigint not null,
    primary key (id),
    constraint fk_booking_resource_manual foreign key (resource_id) references smartcampus.resources (id),
    constraint fk_booking_user_manual foreign key (user_id) references smartcampus.users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
