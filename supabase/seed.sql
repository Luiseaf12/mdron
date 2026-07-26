insert into public.clients (id, name, contact_name, phone, email, ranch) values
('10000000-0000-0000-0000-000000000001', 'Agrícola San José', 'Carlos Moreno', '614 123 9081', 'carlos@agricolasj.mx', 'Rancho El Mezquite'),
('10000000-0000-0000-0000-000000000002', 'Productores del Valle', 'Sofía Pérez', '625 111 2908', 'sofia@valle.mx', 'Las Palmas'),
('10000000-0000-0000-0000-000000000003', 'Hermanos Rivera', 'Diego Rivera', '614 891 1200', 'diego@rivera.mx', 'El Encino');

insert into public.products (id, name, brand, active_ingredient, unit) values
('20000000-0000-0000-0000-000000000001', 'Herbicida Selectivo', 'AgroMax', '2,4-D', 'L/ha'),
('20000000-0000-0000-0000-000000000002', 'Fungicida Sistémico', 'FungiPro', 'Azoxistrobina', 'L/ha'),
('20000000-0000-0000-0000-000000000003', 'Bioestimulante Foliar', 'Verde+', 'Aminoácidos', 'L/ha');

insert into public.applications (id, client_id, service_date, hectares, price_per_hectare, crop, field_name, status) values
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', current_date, 86, 420, 'Maíz', 'Lote Norte', 'en_proceso'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', current_date - 1, 64, 450, 'Nogal', 'Huerta 4', 'completado'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', current_date + 2, 120, 390, 'Algodón', 'Parcela 12', 'programado');

insert into public.application_products (application_id, product_id, dose) values
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1.2),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 0.8),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 1);

