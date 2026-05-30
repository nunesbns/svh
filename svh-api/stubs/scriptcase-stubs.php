<?php

/**
 * --------------------------------------------------------------------------
 * SCRIPTCASE MACROS PHPSTAN STUBS
 * --------------------------------------------------------------------------
 * Este arquivo define todas as macros do Scriptcase para fins de analise
 * estatica (PHPStan) e autocomplete na IDE.
 * Gerado automaticamente via artisan command.
 */

/**
 * Esta macro inicializa um conjunto de transações na base de dados.
 *
 * @param string  $conex__o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_begin_trans
 */
function sc_begin_trans(string $conex__o) {}

/**
 * Esta macro troca dinamicamente as conexões das aplicações.
 *
 * @param string  $conexao_antiga
 * @param string  $conexao_nova
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_change_connection
 */
function sc_change_connection(string $conexao_antiga, string $conexao_nova) {}

/**
 * Faz com que todas as modificações de dados realizadas desde o inicio da
 * transação sejam parte permanente do banco de dados.
 *
 * @param string  $conex__o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_commit_trans
 */
function sc_commit_trans(string $conex__o) {}

/**
 * Esta macro é usada para combinar duas ou mais strings e/ou campos da
 * tabela.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_concat
 */
function sc_concat() {}

/**
 * Esta macro edita uma conexão existente em tempo de execução.
 *
 * @param string  $nome_da_conex__o
 * @param array  $arr_conn
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_connection_edit
 */
function sc_connection_edit(string $nome_da_conex__o, array $arr_conn) {}

/**
 * Esta macro permite a criação de novas conexões dinamicamente.
 *
 * @param string  $nome_da_conex__o
 * @param array  $arr_conn
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_connection_new
 */
function sc_connection_new(string $nome_da_conex__o, array $arr_conn) {}

/**
 * Esta macro desativa o tratamento de erros de banco de dados, padrão do
 * Scriptcase.
 *
 * @param mixed  $evento
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_continue
 */
function sc_error_continue($evento) {}

/**
 * Esta macro configura a variável que contem a mensagem de erro do banco de
 * dados que pode ocorrer durante a exclusão de um registro.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_delete
 */
function sc_error_delete() {}

/**
 * Esta macro configura a variável que contem a mensagem de erro do banco de
 * dados que pode ocorrer durante a inclusão de um registro.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_insert
 */
function sc_error_insert() {}

/**
 * Esta macro configura a variável que contem a mensagem de erro do banco de
 * dados que pode ocorrer durante a atualização de um registro.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_update
 */
function sc_error_update() {}

/**
 * Esta macro executa o comando SQL passado como parâmetro ou o comando SQL
 * contido no campo tipo ação SQL informado.
 *
 * @param string  $sql
 * @param string  $connection
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_exec_sql
 */
function sc_exec_sql(string $sql, string $connection = '') {}

/**
 * Esta macro executa o comando SELECT informado no segundo parâmetro e
 * retorna os dados em uma variável.
 *
 * @param array|false & $dataset
 * @param string  $sql
 * @param string  $connection
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lookup
 */
function sc_lookup(&$dataset, string $sql, string $connection = '') {}

/**
 * Esta macro executa o comando SELECT informado retornando os dados em um
 * array onde a índice é o nome da coluna.
 *
 * @param array|false & $dataset
 * @param string  $comando_sql
 * @param string  $nome_conex__o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lookup_field
 */
function sc_lookup_field(&$dataset, string $comando_sql, string $nome_conex__o) {}

/**
 * Esta macro apaga as trocas feitas usando "sc_change_connection".
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_change_connection
 */
function sc_reset_change_connection() {}

/**
 * Esta macro desfaz as edições de conexão feitas pela macro
 * "sc_connection_edit".
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_connection_edit
 */
function sc_reset_connection_edit() {}

/**
 * Esta macro desfaz as conexões feitas pela macro "sc_connection_new".
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_connection_new
 */
function sc_reset_connection_new() {}

/**
 * Esta macro descarta um set de transações na base de dados.
 *
 * @param string  $conex__o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_rollback_trans
 */
function sc_rollback_trans(string $conex__o) {}

/**
 * Esta macro executa o comando SELECT informado no segundo parâmetro e
 * retorna o dataset em uma variável.
 *
 * @param array|false & $dataset
 * @param string  $sql
 * @param string  $connection
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_select
 */
function sc_select(&$dataset, string $sql, string $connection = '') {}

/**
 * Esta macro altera dinamicamente o campo que será recuperado pela consulta.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_select_field
 */
function sc_select_field($field) {}

/**
 * Esta macro altera dinamicamente o campo da cláusula "ORDER BY" da
 * consulta.
 *
 * @param mixed  $campo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_select_order
 */
function sc_select_order($campo) {}

/**
 * Esta macro adiciona dinamicamente uma condição à cláusula WHERE da
 * consulta.
 *
 * @param mixed  $add
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_select_where
 */
function sc_select_where($add) {}

/**
 * Esta macro permite modificar o tipo de retorno do dataset dos comandos
 * select.
 *
 * @param mixed  $parm
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_fetchmode
 */
function sc_set_fetchmode($parm) {}

/**
 * Essa macro protege valor digitado de acordo com o banco de dados utilizado.
 *
 * @param mixed  $valor
 * @param mixed  $tipo
 * @param string  $conex__o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_sql_protect
 */
function sc_sql_protect($valor, $tipo, string $conex__o) {}

/**
 * Esta macro disponibiliza o conteúdo do select original mais o filtro.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_where_current
 */
function sc_where_current() {}

/**
 * Recupera a cláusula where do select original da aplicação.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_where_orig
 */
function sc_where_orig() {}

/**
 * Esta macro calcula e retorna incrementos e decrementos em datas.
 *
 * @param mixed  $data
 * @param mixed  $formato
 * @param mixed  $operador
 * @param mixed  $d
 * @param mixed  $m
 * @param mixed  $a
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_date
 */
function sc_date($data, $formato, $operador, $d, $m, $a) {}

/**
 * Esta macro converte o conteúdo do campo passado como parâmetro do formato
 * de entrada para o formato de saída.
 *
 * @param mixed  $campo_data
 * @param mixed  $formato_entrada
 * @param mixed  $formato_sa__da
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_date_conv
 */
function sc_date_conv($campo_data, $formato_entrada, $formato_sa__da) {}

/**
 * Esta macro calcula a diferença entre datas em quantidade de dias.
 *
 * @param mixed  $data1
 * @param mixed  $formato_data1
 * @param mixed  $data2
 * @param mixed  $formato_data2
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_date_dif
 */
function sc_date_dif($data1, $formato_data1, $data2, $formato_data2) {}

/**
 * Esta macro calcula diferença entre datas, retornando a quantidade de dias,
 * meses e anos.
 *
 * @param mixed  $data1
 * @param mixed  $formato_data1
 * @param mixed  $data2
 * @param mixed  $formato_data2
 * @param mixed  $op____o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_date_dif_2
 */
function sc_date_dif_2($data1, $formato_data1, $data2, $formato_data2, $op____o) {}

/**
 * Esta macro checa se um campo do tipo data está vazio, retornando um
 * boleano.
 *
 * @param mixed  $campo_data
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_date_empty
 */
function sc_date_empty($campo_data) {}

/**
 * Calcula diferença em horas, retornando a quantidade de horas, minutos e
 * segundos.
 *
 * @param mixed  $datetime_01
 * @param mixed  $formato_datetime_01
 * @param mixed  $datetime_02
 * @param mixed  $formato_datetime_02
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_time_diff
 */
function sc_time_diff($datetime_01, $formato_datetime_01, $datetime_02, $formato_datetime_02) {}

/**
 * Permite que sejam executados métodos JavaScript em eventos de aplicações
 * dos tipos: Formulário, Controle e Calendário.
 *
 * @param mixed  $nomemetodojavascript
 * @param array  $arraypar__metro
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ajax_javascript
 */
function sc_ajax_javascript($nomemetodojavascript, array $arraypar__metro) {}

/**
 * Esta macro altera as propriedades de execução das aplicações.
 *
 * @param string  $aplica____o
 * @param mixed  $propriedade
 * @param mixed  $valor
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_apl_conf
 */
function sc_apl_conf(string $aplica____o, $propriedade, $valor) {}

/**
 * Essa macro permite que o usuário defina na sua aplicação inicial o que
 * irá ocorrer quando a aplicação perder a sessão.
 *
 * @param string  $aplicacao
 * @param mixed  $tipo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_apl_default
 */
function sc_apl_default(string $aplicacao, $tipo) {}

/**
 * Esta macro executa o cálculo de dígitos verificadores.
 *
 * @param mixed  $d__gito
 * @param mixed  $resto
 * @param mixed  $valor
 * @param mixed  $m__dulo
 * @param mixed  $pesos
 * @param mixed  $tipo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_calc_dv
 */
function sc_calc_dv($d__gito, $resto, $valor, $m__dulo, $pesos, $tipo) {}

/**
 * Esta macro retorna "true" se o valor do campo tiver sido modificado.
 *
 * @param mixed  $nome_campo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_changed
 */
function sc_changed($nome_campo) {}

/**
 * Esta macro retorna, o campo ou variável criptografada, à sua forma
 * original.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_decode
 */
function sc_decode($field) {}

/**
 * Esta macro retorna, o campo ou variável, de forma criptografada.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_encode
 */
function sc_encode($field) {}

/**
 * Interrompe a execução do código utilizando um return e deve ser sempre
 * utilizada em conjunto com a macro "sc_error_message".
 *
 * @param string  $nome_app_url
 * @param string  $target
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_exit
 */
function sc_error_exit(string $nome_app_url, string $target) {}

/**
 * Esta macro gera uma mensagem de erro.
 *
 * @param string  $texto
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_error_message
 */
function sc_error_message(string $texto) {}

/**
 * Esta macro força a saida da aplicação.
 *
 * @param mixed  $op____o
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_exit
 */
function sc_exit($op____o) {}

/**
 * Ignora as validações definidas na tela de configuração dos campos, tais
 * como: Validação do CPF, campos obrigatórios, entre outras.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_no_validate
 */
function sc_field_no_validate($field) {}

/**
 * Esta macro atribui as propiedades de um campo para uma variável
 * javascript.
 *
 * @param mixed  $meucampo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_getfield
 */
function sc_getfield($meucampo) {}

/**
 * Esta macro retorna a sigla do idioma em uso.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_get_language
 */
function sc_get_language() {}

/**
 * Esta macro retorna a sigla da configuração regional em uso.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_get_regional
 */
function sc_get_regional() {}

/**
 * Esta macro retorna o nome do tema do layout em uso.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_get_theme
 */
function sc_get_theme() {}

/**
 * Recupera o id da página atual, na transição entre os passos de um
 * formulário wizard.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_get_wizard_step
 */
function sc_get_wizard_step() {}

/**
 * Esta macro altera dinamicamente o label dos campos que são apresentados
 * nas linhas de quebra.
 *
 * @param mixed  $meu_campo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_groupby_label
 */
function sc_groupby_label($meu_campo) {}

/**
 * Esta macro carrega, para serem usadas na aplicação, as imagens passadas
 * como parâmentro.
 *
 * @param mixed  $imagem01_jpg
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_image
 */
function sc_image($imagem01_jpg) {}

/**
 * Esta macro é usada para efetuar "include" de rotinas PHP.
 *
 * @param mixed  $arquivo
 * @param mixed  $origem
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_include
 */
function sc_include($arquivo, $origem) {}

/**
 * Esta macro é usada para selecionar dinamicamente as bibliotecas da
 * aplicação.
 *
 * @param mixed  $lib1
 * @param mixed  $lib2
 * @param mixed ... $args
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_include_lib
 */
function sc_include_lib($lib1, $lib2, ...$args) {}

/**
 * Inclue na aplicação um arquivo PHP de uma biblioteca criada no
 * Scriptcase.
 *
 * @param mixed  $escopo
 * @param mixed  $nome_da_biblioteca
 * @param mixed  $arquivo
 * @param mixed  $include_once
 * @param mixed  $require
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_include_library
 */
function sc_include_library($escopo, $nome_da_biblioteca, $arquivo, $include_once, $require) {}

/**
 * Esta macro altera dinamicamente o label do campo.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_label
 */
function sc_label($field) {}

/**
 * Esta macro retorna o idioma da aplicação.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_language
 */
function sc_language() {}

/**
 * Esta macro cria dinamicamente um link para outra aplicação.
 *
 * @param mixed  $coluna
 * @param string  $aplica____o
 * @param mixed  $par__metros
 * @param mixed  $hint
 * @param string  $target
 * @param mixed  $altura
 * @param mixed  $largura
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_link
 */
function sc_link($coluna, string $aplica____o, $par__metros, $hint, string $target, $altura, $largura) {}

/**
 * Esta macro adiciona um registro a tabela de log.
 *
 * @param mixed  $a____o
 * @param string  $mensagem
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_log_add
 */
function sc_log_add($a____o, string $mensagem) {}

/**
 * Esta macro retorna o que foi inserido no campo descrição na tabela de log
 * em forma de array.
 *
 * @param mixed  $descricao
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_log_split
 */
function sc_log_split($descricao) {}

/**
 * Esta macro é usada pra o envio de e-mails.
 *
 * @param mixed  $smtp
 * @param mixed  $usr
 * @param mixed  $pw
 * @param mixed  $de
 * @param mixed  $para
 * @param mixed  $assunto
 * @param string  $mensagem
 * @param mixed  $tipo_mens
 * @param mixed  $c__pias
 * @param mixed  $tp_c__pias
 * @param mixed  $porta
 * @param string  $tp_conexao
 * @param mixed  $anexo
 * @param mixed  $ssl
 * @param mixed  $reply_to
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_mail_send
 */
function sc_mail_send($smtp, $usr, $pw, $de, $para, $assunto, string $mensagem, $tipo_mens, $c__pias, $tp_c__pias, $porta, string $tp_conexao, $anexo, $ssl, $reply_to) {}

/**
 * Esta macro cria uma string contendo os dados de um link para outra
 * aplicação.
 *
 * @param string  $aplica____o
 * @param mixed  $par__metros
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_make_link
 */
function sc_make_link(string $aplica____o, $par__metros) {}

/**
 * Esta macro atualiza um objeto da aplicação Mestre em uma aplicação
 * Detalhe.
 *
 * @param mixed  $objeto
 * @param mixed  $valor
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_master_value
 */
function sc_master_value($objeto, $valor) {}

/**
 * Esta macro tem por objetivo redirecionar para outra aplicação.
 *
 * @param string  $apl
 * @param string  $params
 * @param string  $target
 * @param string  $error
 * @param string  $target_dest
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_redir
 */
function sc_redir(string $apl, string $params = '', string $target = '', string $error = '', string $target_dest = '') {}

/**
 * Essa macro tem como finalidade resetar as configurações da macro
 * sc_apl_default.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_apl_default
 */
function sc_reset_apl_default() {}

/**
 * Esta macro elimina as váriaveis de sessão recebidas como parâmetro.
 *
 * @param mixed  $vari__vel_global1
 * @param mixed ... $args
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_global
 */
function sc_reset_global($vari__vel_global1, ...$args) {}

/**
 * Envia notificações dinamicamente para os usuários do sistema.
 *
 * @param mixed  $title
 * @param string  $message
 * @param mixed  $destiny_type
 * @param mixed  $to
 * @param mixed  $from
 * @param mixed  $link
 * @param mixed  $dtexpire
 * @param mixed  $profile
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_send_notification
 */
function sc_send_notification($title, string $message, $destiny_type, $to, $from, $link, $dtexpire, $profile) {}

/**
 * Esta macro disponibiliza o número sequencial do registro que está sendo
 * processado.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_seq_register
 */
function sc_seq_register() {}

/**
 * Esta macro registra variáveis de sessão.
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_global
 */
function sc_set_global($field) {}

/**
 * Macro usada para selecionar a regra das quebra
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_groupby_rule
 */
function sc_set_groupby_rule() {}

/**
 * Esta macro altera o idioma das aplicações.
 *
 * @param string  $string_language
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_language
 */
function sc_set_language(string $string_language) {}

/**
 * Esta macro altera a configuração regional das aplicações.
 *
 * @param string  $string_regional
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_regional
 */
function sc_set_regional(string $string_regional) {}

/**
 * Esta macro define, dinamicamente, o tema nas aplicações.
 *
 * @param string  $string_tema
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_theme
 */
function sc_set_theme(string $string_tema) {}

/**
 * Esta macro verifica se está sendo utilizado um site seguro. (protocolo
 * https).
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_site_ssl
 */
function sc_site_ssl() {}

/**
 * Calcula e retorna um array com os valores estatísticos, a partir de uma
 * array com valores numéricos
 *
 * @param array  $arr_val
 * @param mixed  $tp_var
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_statistic
 */
function sc_statistic(array $arr_val, $tp_var) {}

/**
 * Esta macro tem como finalidade setar o numero de casas decimais.
 *
 * @param mixed  $field
 * @param mixed  $quantidade_decimal
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_trunc_num
 */
function sc_trunc_num($field, $quantidade_decimal) {}

/**
 * Esta macro altera a URL de saída da aplicação.
 *
 * @param string  $url
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_url_exit
 */
function sc_url_exit(string $url) {}

/**
 * Retorna o caminho de um arquivo, dentro de uma biblioteca, para ser usado
 * nas aplicações.
 *
 * @param mixed  $escopo
 * @param mixed  $nome_da_biblioteca
 * @param mixed  $arquivo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_url_library
 */
function sc_url_library($escopo, $nome_da_biblioteca, $arquivo) {}

/**
 * Gera valor por extenso.
 *
 * @param mixed  $valor
 * @param mixed  $tam_linha
 * @param mixed  $tipo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_vl_extenso
 */
function sc_vl_extenso($valor, $tam_linha, $tipo) {}

/**
 * Esta macro ativa ou desativa o controle de mensagens de advertência
 *
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_warning
 */
function sc_warning(string $status) {}

/**
 * Esta macro é usada para comunicação com um serviço web.
 *
 * @param mixed  $m__todo
 * @param string  $url
 * @param mixed  $porta
 * @param mixed  $m__todo_de_envio
 * @param array  $array_de_par__metros
 * @param array  $array_de_configura____o
 * @param mixed  $timeout
 * @param mixed  $retorno
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_webservice
 */
function sc_webservice($m__todo, string $url, $porta, $m__todo_de_envio, array $array_de_par__metros, array $array_de_configura____o, $timeout, $retorno) {}

/**
 * Esta macro é usada para gerar arquivo tipo ZIP, à partir de uma lista de
 * arquivos e/ou diretórios.
 *
 * @param mixed  $arquivo
 * @param mixed  $zip
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_zip_file
 */
function sc_zip_file($arquivo, $zip) {}

/**
 * Esta macro gera os valores que compõem o código de barras no padrão
 * Febraban arrecadação.
 *
 * @param mixed  $c__digo_barra
 * @param mixed  $c__digo_seguimento
 * @param mixed  $c__digo_moeda
 * @param mixed  $valor
 * @param mixed  $livre
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lin_cod_barra_arrecadacao
 */
function sc_lin_cod_barra_arrecadacao($c__digo_barra, $c__digo_seguimento, $c__digo_moeda, $valor, $livre) {}

/**
 * Esta macro gera a linha digitável para bloquetos de cobrança, a partir da
 * linha do código de barras, padrão bancário.
 *
 * @param mixed  $c__digo_barra
 * @param mixed  $c__digo_banco
 * @param mixed  $c__digo_moeda
 * @param mixed  $valor
 * @param mixed  $livre
 * @param mixed  $data_vencimento
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lin_cod_barra_banco
 */
function sc_lin_cod_barra_banco($c__digo_barra, $c__digo_banco, $c__digo_moeda, $valor, $livre, $data_vencimento) {}

/**
 * Esta macro gera a linha digitável para boletos de cobrança a partir da
 * linha do código de barras, padrão arrecadação.
 *
 * @param mixed  $linha_digitavel
 * @param mixed  $c__digo_barras
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lin_digitavel_arrecadacao
 */
function sc_lin_digitavel_arrecadacao($linha_digitavel, $c__digo_barras) {}

/**
 * Esta macro gera a linha digitável para boletos de cobrança, a partir da
 * linha do código de barras, padrão bancário.
 *
 * @param mixed  $linha_digitavel
 * @param mixed  $c__digo_barras
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_lin_digitavel_banco
 */
function sc_lin_digitavel_banco($linha_digitavel, $c__digo_barras) {}

/**
 * Esta macro disponibiliza o conteúdo da cláusula where gerada pelo
 * formulário de filtro.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_where_filter
 */
function sc_where_filter() {}

/**
 * Esta macro tem por objetivo proteger ou liberar a utilização das
 * aplicações em geral.
 *
 * @param string  $aplica____o
 * @param mixed  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_apl_status
 */
function sc_apl_status(string $aplica____o, $status) {}

/**
 * Recupera os grupos existentes no Active Directory (AD).
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ldap_groups
 */
function sc_ldap_groups() {}

/**
 * Macro principal para autenticação LDAP, responsável por estabelecer a
 * conexão com o servidor.
 *
 * @param string  $server
 * @param mixed  $version
 * @param string  $user
 * @param string  $password
 * @param mixed  $dn
 * @param mixed  $group
 * @param mixed  $port
 * @param mixed  $biblioteca
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ldap_login
 */
function sc_ldap_login(string $server, $version, string $user, string $password, $dn, $group, $port, $biblioteca) {}

/**
 * Macro usada para liberar a conexão após a utilização da macro
 * sc_ldap_login.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ldap_logout
 */
function sc_ldap_logout() {}

/**
 * Macro utilizada para realizar buscas no LDAP.
 *
 * @param mixed  $filter__all
 * @param array  $attributes__array
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ldap_search
 */
function sc_ldap_search($filter__all, array $attributes__array) {}

/**
 * Recupera usuários do LDAP e seus atributos conforme as permissões do
 * usuário autenticado.
 *
 * @param mixed  $filter__all
 * @param array  $attributes__array
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ldap_users
 */
function sc_ldap_users($filter__all, array $attributes__array) {}

/**
 * Esta macro apaga todas as alterações efetuadas pela macro "sc_apl_conf".
 *
 * @param string  $aplica____o
 * @param mixed  $propriedade
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_apl_conf
 */
function sc_reset_apl_conf(string $aplica____o, $propriedade) {}

/**
 * Esta macro deleta todas as variáveis de status de segurança das
 * aplicações.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_apl_status
 */
function sc_reset_apl_status() {}

/**
 * Esta macro restaura ítens da estrutura do menu. (retirados pela macro
 * "sc_menu_delete").
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_menu_delete
 */
function sc_reset_menu_delete() {}

/**
 * Esta macro habilita ítens da estrutura do menu (desabilitados pela macro
 * "sc_menu_disable").
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_reset_menu_disable
 */
function sc_reset_menu_disable() {}

/**
 * Esta macro protege o campo/variável contra "SQL injection"
 *
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_sql_injection
 */
function sc_sql_injection($field) {}

/**
 * Macro utilizada para deslogar o usuario informado do sistema.
 *
 * @param mixed  $nome_da_vari__vel
 * @param mixed  $conte__do_da_vari__vel
 * @param string  $apl_redir_php
 * @param string  $target
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_user_logout
 */
function sc_user_logout($nome_da_vari__vel, $conte__do_da_vari__vel, string $apl_redir_php, string $target) {}

/**
 * Exibe mensagens personalizadas durante a execução da aplicação,
 * exclusiva para uso em eventos Ajax como alertas e confirmações.
 *
 * @param string  $mensagem
 * @param mixed  $titulo
 * @param mixed  $configuracaovisual
 * @param mixed  $parametrosredirecionamento
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ajax_message
 */
function sc_ajax_message(string $mensagem, $titulo, $configuracaovisual, $parametrosredirecionamento) {}

/**
 * Utilizada para recarregar dinamicamente os dados em aplicações de
 * consulta.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_ajax_refresh
 */
function sc_ajax_refresh() {}

/**
 * Esta macro exibe uma tela de mensagem no estilo Javascript.
 *
 * @param string  $message
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_alert
 */
function sc_alert(string $message) {}

/**
 * Esta macro permite, dinamicamente, exibir ou não os campos de um
 * determinado bloco.
 *
 * @param mixed  $nome_do_bloco
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_block_display
 */
function sc_block_display($nome_do_bloco, string $status) {}

/**
 * Controla dinamicamente a exibição do captcha na aplicação.
 *
 * @param mixed  $on_off
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_captcha_display
 */
function sc_captcha_display($on_off) {}

/**
 * Permite manipular propriedades CSS dos campos e linhas da consulta.
 *
 * @param mixed  $nome_atributo
 * @param mixed  $valor
 * @param mixed  $field
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_change_css
 */
function sc_change_css($nome_atributo, $valor, $field) {}

/**
 * Esta macro exibe uma tela de confirmação Javascript.
 *
 * @param string  $mensagem
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_confirm
 */
function sc_confirm(string $mensagem) {}

/**
 * Permite adicionar um texto de ajuda nos links criados a partir de um evento
 * ajax onClick.
 *
 * @param mixed  $field
 * @param string  $mensagem_de_ajuda
 * @param mixed  $largura_maxima
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_event_hint
 */
function sc_event_hint($field, string $mensagem_de_ajuda, $largura_maxima) {}

/**
 * Esta macro altera a cor do texto de um determinado campo.
 *
 * @param mixed  $field
 * @param string  $color
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_color
 */
function sc_field_color($field, string $color) {}

/**
 * Esta macro tem por objetivo bloquear a digitação em determinados campos
 * do formulário.
 *
 * @param bool  $nome_campo__true_false
 * @param mixed  $par__metro
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_disabled
 */
function sc_field_disabled(bool $nome_campo__true_false, $par__metro) {}

/**
 * Esta macro tem por objetivo bloquear a digitação em determinados campos
 * de cada linha nos formulários.
 *
 * @param bool  $nome_campo__true_false
 * @param mixed  $par__metro
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_disabled_record
 */
function sc_field_disabled_record(bool $nome_campo__true_false, $par__metro) {}

/**
 * Esta macro permite, dinamicamente, exibir ou não um determinado campo.
 *
 * @param mixed  $field
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_display
 */
function sc_field_display($field, string $status) {}

/**
 * Esta macro tem por objetivo inibir campos da consulta na carga inicial.
 *
 * @param mixed  $field
 * @param mixed  $field1
 * @param mixed ... $args
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_init_off
 */
function sc_field_init_off($field, $field1, ...$args) {}

/**
 * Esta macro permite, dinamicamente, transformar em readonly um determinado
 * campo do formulário.
 *
 * @param mixed  $field
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_readonly
 */
function sc_field_readonly($field, string $status) {}

/**
 * A macro sc_field_style permite personalizar dinamicamente o estilo CSS dos
 * campos em Consultas na plataforma Scriptcase.
 *
 * @param mixed  $field
 * @param string  $background_color
 * @param mixed  $size
 * @param string  $color
 * @param mixed  $family
 * @param mixed  $weight
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_field_style
 */
function sc_field_style($field, string $background_color, $size, string $color, $family, $weight) {}

/**
 * Essa macro inibe a exibição do rodapé.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_foot_hide
 */
function sc_foot_hide() {}

/**
 * Esta macro e usada para formatar valores numéricos.
 *
 * @param mixed  $field
 * @param mixed  $simb_grp
 * @param mixed  $simb_dec
 * @param mixed  $qtde_dec
 * @param mixed  $enche_zeros
 * @param mixed  $lado_neg
 * @param mixed  $simb_monet__rio
 * @param mixed  $lado_simb_monetario
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_format_num
 */
function sc_format_num($field, $simb_grp, $simb_dec, $qtde_dec, $enche_zeros, $lado_neg, $simb_monet__rio, $lado_simb_monetario) {}

/**
 * Esta macro tem por objetivo a formatação de valores numéricos,
 * utilizando as configurações regionais.
 *
 * @param mixed  $field
 * @param mixed  $qtde_dec
 * @param mixed  $enche_zeros
 * @param mixed  $simb_monet__rio
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_format_num_region
 */
function sc_format_num_region($field, $qtde_dec, $enche_zeros, $simb_monet__rio) {}

/**
 * Esta macro permite, dinamicamente, exibir ou não o formulário.
 *
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_form_show
 */
function sc_form_show(string $status) {}

/**
 * Esta macro disponibiliza a regra da quebra que está em execução.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_get_groupby_rule
 */
function sc_get_groupby_rule() {}

/**
 * Esta macro inibe a exibição de cabeçalho.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_head_hide
 */
function sc_head_hide() {}

/**
 * Macro usada para desativar Regras de Quebras.
 *
 * @param mixed  $group1
 * @param mixed  $grop2
 * @param mixed  $group3
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_hide_groupby_rule
 */
function sc_hide_groupby_rule($group1, $grop2, $group3) {}

/**
 * Esta macro setá o focus para um determinado campo do formulário.
 *
 * @param mixed  $campo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_focus
 */
function sc_set_focus($campo) {}

/**
 * Esta macro altera a visualização do texto do campo.
 *
 * @param mixed  $field
 * @param string  $background_color
 * @param mixed  $size
 * @param string  $color
 * @param mixed  $family
 * @param mixed  $weight
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_text_style
 */
function sc_text_style($field, string $background_color, $size, string $color, $family, $weight) {}

/**
 * Altera dinamicamente propriedades visuais de um widget.
 *
 * @param array  $arrayoptions
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_widget_config
 */
function sc_widget_config(array $arrayoptions) {}

/**
 * Retorna dados comparativos de um widget de índice, como valor, período e
 * variação.
 *
 * @param mixed  $dataname
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_widget_data
 */
function sc_widget_data($dataname) {}

/**
 * Retorna o nome do widget em execução.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_widget_name
 */
function sc_widget_name() {}

/**
 * Recupera o tipo de widget em execução: index, link ou divider.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_widget_type
 */
function sc_widget_type() {}

/**
 * Recupera o estado atual do botão AJAX da barra de ações no momento do
 * clique.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_clicked_state
 */
function sc_actionbar_clicked_state() {}

/**
 * Permite desabilitar, dinamicamente, os botões criados pelo usuário na
 * barra de ação.
 *
 * @param mixed  $nome_do_botao
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_disable
 */
function sc_actionbar_disable($nome_do_botao) {}

/**
 * Permite habilitar, dinamicamente, os botões criados pelo usuário na barra
 * de ação que foram desabilitados pela macro sc_actionbar_disable.
 *
 * @param mixed  $nome_do_botao
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_enable
 */
function sc_actionbar_enable($nome_do_botao) {}

/**
 * Possibilita que o desenvolvedor esconda dinamicamente o botão da barra de
 * ação.
 *
 * @param mixed  $nome_do_botao
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_hide
 */
function sc_actionbar_hide($nome_do_botao) {}

/**
 * Esta macro possibilita a exibição dos botões da barra de ação que
 * foram escondidos utilizando a macro sc_actionbar_hide
 *
 * @param mixed  $nome_do_botao
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_show
 */
function sc_actionbar_show($nome_do_botao) {}

/**
 * Define, dinamicamente, um novo estado para o botão do tipo ajax criado na
 * barra de ações.
 *
 * @param mixed  $nome_do_botao
 * @param mixed  $nome_do_estado
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_actionbar_state
 */
function sc_actionbar_state($nome_do_botao, $nome_do_estado) {}

/**
 * Esta macro retorna "true" quando o botão "Copiar" é selecionado em um
 * formulário.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_copy
 */
function sc_btn_copy() {}

/**
 * Esta macro retorna "true" quando o botão "Excluir" é selecionado em um
 * formulário.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_delete
 */
function sc_btn_delete() {}

/**
 * Tem o objetivo de habilitar ou desabilitar dinamicamente um botão da barra
 * ferramenta.
 *
 * @param mixed  $nome_botao
 * @param string  $status
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_disabled
 */
function sc_btn_disabled($nome_botao, string $status) {}

/**
 * Esta macro torna visível, ou não, um botão da barra de ferramentas em
 * tempo de execução da aplicação.
 *
 * @param mixed  $nome_botao
 * @param mixed  $on_off
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_display
 */
function sc_btn_display($nome_botao, $on_off) {}

/**
 * Esta macro retorna "true" quando o botão "Inserir" é selecionado em um
 * formulário.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_insert
 */
function sc_btn_insert() {}

/**
 * Esta macro serve para alterar dinamicamente a label dos botões.
 *
 * @param mixed  $nome_botao
 * @param mixed  $nova_label
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_label
 */
function sc_btn_label($nome_botao, $nova_label) {}

/**
 * Esta macro retorna "true" quando o botão "Novo" é selecionado em um
 * formulário.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_new
 */
function sc_btn_new() {}

/**
 * Esta macro retorna "true" quando o botão "Alterar" é selecionado em um
 * formulário.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_update
 */
function sc_btn_update() {}

/**
 * Altera o nome dos arquivos exportados pela consulta
 *
 * @param mixed  $tipo_exportacao
 * @param mixed  $nome_do_arquivo
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_set_export_name
 */
function sc_set_export_name($tipo_exportacao, $nome_do_arquivo) {}

/**
 * Esta macro adiciona um item ao menu dinamicamente.
 *
 * @param mixed  $menu_nome
 * @param mixed  $id_item
 * @param mixed  $id_pai
 * @param mixed  $label
 * @param string  $aplica____o
 * @param mixed  $par__metro
 * @param mixed  $icone
 * @param mixed  $hint
 * @param string  $target
 * @param mixed  $mega_menu
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_add_item
 */
function sc_appmenu_add_item($menu_nome, $id_item, $id_pai, $label, string $aplica____o, $par__metro, $icone, $hint, string $target, $mega_menu) {}

/**
 * Esta macro cria um menu de forma dinâmica.
 *
 * @param mixed  $menu_nome
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_create
 */
function sc_appmenu_create($menu_nome) {}

/**
 * Esta Macro verifica se existe um item do menu.
 *
 * @param mixed  $menu_nome
 * @param mixed  $id_item
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_exist_item
 */
function sc_appmenu_exist_item($menu_nome, $id_item) {}

/**
 * Esta macro remove dinamicamente um item do menu.
 *
 * @param mixed  $menu_nome
 * @param mixed  $id_item
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_remove_item
 */
function sc_appmenu_remove_item($menu_nome, $id_item) {}

/**
 * Esta macro limpa o array para montagem dinâmica de um menu.
 *
 * @param mixed  $menu_nome
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_reset
 */
function sc_appmenu_reset($menu_nome) {}

/**
 * Esta macro atualiza um item do menu.
 *
 * @param mixed  $menu_nome
 * @param mixed  $id_item
 * @param mixed  $id_pai
 * @param mixed  $label
 * @param string  $aplica____o
 * @param mixed  $par__metro
 * @param mixed  $icone
 * @param mixed  $hint
 * @param string  $target
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_appmenu_update_item
 */
function sc_appmenu_update_item($menu_nome, $id_item, $id_pai, $label, string $aplica____o, $par__metro, $icone, $hint, string $target) {}

/**
 * Desabilita botões do Menu.
 *
 * @param mixed  $id_do_bot__o
 * @param mixed  $on_off
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_btn_disable
 */
function sc_btn_disable($id_do_bot__o, $on_off) {}

/**
 * Esta macro remove ítens da estrutura do menu.
 *
 * @param mixed  $id_item1
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_menu_delete
 */
function sc_menu_delete($id_item1) {}

/**
 * Esta macro desabilita ítens da estrutura do menu.
 *
 * @param mixed  $id_item1
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_menu_disable
 */
function sc_menu_disable($id_item1) {}

/**
 * Macro utilizada para forçar a criação do menu para dispositivos móveis.
 *
 * @param bool  $boolean
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_menu_force_mobile
 */
function sc_menu_force_mobile(bool $boolean) {}

/**
 * Esta macro Identifica qual item do menu foi clicado.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_menu_item
 */
function sc_menu_item() {}

/**
 * Esta macro Identifica o nome da aplicação que foi selecionada nos itens
 * do menu.
 *
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_script_name
 */
function sc_script_name() {}

/**
 * Essa macro é utilizada para fazer o download de arquivos utilizando as
 * APIs de armazenamento.
 *
 * @param mixed  $profile
 * @param mixed  $settings
 * @param mixed  $file
 * @param mixed  $destination
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_api_download
 */
function sc_api_download($profile, $settings, $file, $destination) {}

/**
 * A macro sc_api_gc_get_obj gera o token_code
 *
 * @param mixed  $app_name
 * @param mixed  $json_oauth
 * @param mixed  $auth_code
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_api_gc_get_obj
 */
function sc_api_gc_get_obj($app_name, $json_oauth, $auth_code) {}

/**
 * Essa macro gera uma URL para a autenticação do usuário da conta google
 * utilizada para configuração da API
 *
 * @param mixed  $app_name
 * @param mixed  $json_oauth
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_api_gc_get_url
 */
function sc_api_gc_get_url($app_name, $json_oauth) {}

/**
 * Essa macro é utilizada para deletar arquivos armazenados em serviços de
 * armazenamento em nuvem.
 *
 * @param mixed  $profile
 * @param mixed  $file
 * @param mixed  $parents
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_api_storage_delete
 */
function sc_api_storage_delete($profile, $file, $parents) {}

/**
 * Essa macro é utilizada para fazer o upload de arquivos utilizando as APIs
 * de Storage.
 *
 * @param mixed  $profile
 * @param mixed  $settings
 * @param mixed  $file
 * @param mixed  $parents
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_api_upload
 */
function sc_api_upload($profile, $settings, $file, $parents) {}

/**
 * Permite utilizar as APIs integradas ao Scriptcase.
 *
 * @param mixed  $profile
 * @param array  $arr_settings
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_call_api
 */
function sc_call_api($profile, array $arr_settings) {}

/**
 * Permite o envio dinâmico de e-mails integrados com Mandrill e Amazon SES
 *
 * @param array  $arr_settings
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_send_mail_api
 */
function sc_send_mail_api(array $arr_settings) {}

/**
 * Permite o envio dinâmico de mensagem SMS para as APIs do Scriptcase.
 *
 * @param array  $arr_settings
 * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#sc_send_sms
 */
function sc_send_sms(array $arr_settings) {}

