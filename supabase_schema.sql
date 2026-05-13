-- =============================================
-- CroniCare Control — Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. HOSPITAIS
create table if not exists hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- 2. PACIENTES
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals(id),
  name text not null,
  birthdate date,
  diagnosis text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. PERFIS DE USUÁRIO (pai, mãe, cuidadora, hospital)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('admin','hospital','caregiver')),
  hospital_id uuid references hospitals(id),
  created_at timestamptz default now()
);

-- 4. ACESSO DE CUIDADORES AOS PACIENTES
create table if not exists patient_caregivers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(patient_id, profile_id)
);

-- 5. INSUMOS POR PACIENTE
create table if not exists supplies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  codigo text,
  nome text not null,
  categoria text not null,
  unidade text not null default 'Unid',
  estoque integer not null default 0,
  minimo integer not null default 5,
  consumo_mensal integer[] default '{0,0,0,0}',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. LOTES / VALIDADES
create table if not exists supply_lots (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid references supplies(id) on delete cascade,
  lote text not null,
  validade date not null,
  quantidade integer not null default 1,
  created_at timestamptz default now()
);

-- 7. MOVIMENTAÇÕES DE ESTOQUE (baixas e entradas)
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid references supplies(id) on delete cascade,
  patient_id uuid references patients(id),
  profile_id uuid references profiles(id),
  tipo text not null check (tipo in ('baixa','entrada','ajuste')),
  quantidade integer not null,
  observacao text,
  created_at timestamptz default now()
);

-- 8. KITS DE PROCEDIMENTO (futuro)
create table if not exists kits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  nome text not null,
  descricao text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references kits(id) on delete cascade,
  supply_id uuid references supplies(id) on delete cascade,
  quantidade integer not null default 1
);

-- 9. SOLICITAÇÕES AO HOSPITAL
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  profile_id uuid references profiles(id),
  tipo text not null check (tipo in ('urgencia','reposicao','complementar')),
  status text not null default 'pendente' check (status in ('pendente','em_atendimento','concluido')),
  observacao text,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

-- =============================================
-- TRIGGER: atualiza updated_at em supplies
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger supplies_updated_at
  before update on supplies
  for each row execute function update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
alter table hospitals enable row level security;
alter table patients enable row level security;
alter table profiles enable row level security;
alter table patient_caregivers enable row level security;
alter table supplies enable row level security;
alter table supply_lots enable row level security;
alter table stock_movements enable row level security;
alter table kits enable row level security;
alter table kit_items enable row level security;
alter table requests enable row level security;

-- Policies: usuário autenticado acessa dados dos seus pacientes
create policy "caregivers_see_own_patients" on patients
  for all using (
    id in (
      select patient_id from patient_caregivers
      where profile_id = auth.uid()
    )
    or
    hospital_id in (
      select hospital_id from profiles where id = auth.uid()
    )
  );

create policy "caregivers_see_supplies" on supplies
  for all using (
    patient_id in (
      select patient_id from patient_caregivers where profile_id = auth.uid()
      union
      select id from patients where hospital_id in (
        select hospital_id from profiles where id = auth.uid()
      )
    )
  );

create policy "caregivers_see_lots" on supply_lots
  for all using (
    supply_id in (
      select id from supplies where patient_id in (
        select patient_id from patient_caregivers where profile_id = auth.uid()
      )
    )
  );

create policy "caregivers_see_movements" on stock_movements
  for all using (
    patient_id in (
      select patient_id from patient_caregivers where profile_id = auth.uid()
      union
      select id from patients where hospital_id in (
        select hospital_id from profiles where id = auth.uid()
      )
    )
  );

create policy "users_own_profile" on profiles
  for all using (id = auth.uid());

create policy "caregivers_see_kits" on kits
  for all using (
    patient_id in (
      select patient_id from patient_caregivers where profile_id = auth.uid()
    )
  );

create policy "caregivers_see_kit_items" on kit_items
  for all using (
    kit_id in (select id from kits where patient_id in (
      select patient_id from patient_caregivers where profile_id = auth.uid()
    ))
  );

create policy "caregivers_see_requests" on requests
  for all using (
    patient_id in (
      select patient_id from patient_caregivers where profile_id = auth.uid()
      union
      select id from patients where hospital_id in (
        select hospital_id from profiles where id = auth.uid()
      )
    )
  );

-- =============================================
-- DADOS INICIAIS: Hospital e Paciente Leonardo
-- =============================================
insert into hospitals (id, name, email) values
  ('00000000-0000-0000-0000-000000000001', 'Hospital', 'hospital@hospital.com.br')
on conflict do nothing;

insert into patients (id, hospital_id, name, birthdate) values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Leonardo Bertolozzi Monteiro', '2015-01-17')
on conflict do nothing;
