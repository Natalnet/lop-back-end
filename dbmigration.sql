use lop2teste;
alter table classHasTest add correcao enum('DISPONIVEL','INDISPONIVEL') not NULL default('INDISPONIVEL');