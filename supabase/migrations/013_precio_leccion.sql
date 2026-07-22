alter table lecciones
  add column if not exists precio numeric(10,2) not null default 0;
