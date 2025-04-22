/*
 * Constantes Peticiones Ajax
 */
const CARGAR_INFORMACION = 100;
const CONSULTAR_USUARIOS_GRUPOS = 101;
const REGISTRAR_GRUPO = 102;
const ELIMINAR_GRUPO = 103;
const CARGAR_USUARIOS_GRUPO = 104;
const ASIGNAR_USUARIO = 105;
const ASIGNAR_USUARIO_SUPERVISOR = 106;
const CARGAR_USUARIOS = 107;
const ASIGNAR_USUARIOS = 108;
const CARGAR_FLUJOS_GRUPO = 109;
const ASIGNAR_FLUJO = 110;
const ASIGNAR_FLUJOS = 111;
/*
 * Declaracion de variables globales
 */
let tablaUsuarioGrupos = null;
let tablaUsuarios = null;
let tablaFlujos = null;
let objDatosRegistro = {};
let idGrupo = null;
let asignacion = false;
let isEnabled = false;

$(document).ready(function () {
    iniciarInterfaz();
});

function iniciarInterfaz() {
    $(".logoModal1").attr("src", "../" + RUTA_MENU_REL + RUTA_IMG + LOGO_ENCABEZADO_MIN);
    $(".logoModal2").attr("src", "../" + RUTA_MENU_REL + RUTA_IMG + LOGO_SECUNDARIO);
    $("#buscar").on("click", function () {
        cargarRegistros();
    });
    $('#salir').click(function () {
        location.href = '../../acceso/menu.html';
    });

    cargarInformacion();
    $('.divEstados div').on('click', function () {
        $('.divEstados .divSelected').removeClass('divSelected');
        $(this).addClass('divSelected');
    });

    $("#registrar,#actualizar").on("click", function () {
        if (validarDatosRegistro()) {
            registrarGrupo();
        }
    });
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#sidebarCollapse img').toggleClass('rotateImg');
        $('#content').toggleClass('active');
    });
}

function cargarUsuariosFiltro() {
    spinner("Cargando usuarios, por favor espere ....");
    let parametros = {accion: CARGAR_USUARIOS, empresa: $("#empresas").val()};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        let datos = result.data;
        $("#usuarios").addClass("form-control selectpicker");
        $("#usuarios").attr({
            "data-style": "form-control btn-new",
            "data-width": "100%",
            "data-size": "10",
            "data-selected-text-format": "count",
            "data-live-search-normalize": true,
            "data-actions-box": true,
            "data-live-search": true,
            "data-dropup-auto": false,
            "data-none-selected-text": " -- Seleccione -- "
        });
        $(datos).each(function (i, obj) {
            let opt = $("<option/>").val(obj.id).html(obj.nombre);
            $("#usuarios").append(opt);
        });
        $("#usuarios").selectpicker();
    };
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}

function cargarInformacion() {
    let parametros = {accion: CARGAR_INFORMACION};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        if (result.esSuperAdmin) {
            $("#filtroEmpresas").removeClass("oculto");

            $("#empresas").addClass("form-control selectpicker");
            $("#empresas").attr({
                "data-style": "form-control btn-new",
                "data-width": "100%",
                "data-size": "10",
                "data-selected-text-format": "count",
                "data-live-search-normalize": true,
                "data-actions-box": true,
                "data-live-search": true,
                "data-dropup-auto": false,
                "data-none-selected-text": " -- Seleccione -- "
            });
            $(result.empresas).each(function (i, obj) {
                let option = $("<option/>");
                option.val(obj.idempresausr);
                option.html(obj.razonsocial);
                $("#empresas").append(option);
            });
            $("#empresas").val(result.idempresausr);
            $("#empresas").selectpicker();
        }
        cargarRegistros();
        cargarUsuariosFiltro();
    };
    spinner("Consultando empresas, Por favor espere...");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this);
}

function cargarRegistros() {
    if (tablaUsuarioGrupos == null) {
        tablaUsuarioGrupos = $("#tablaUsuarioGrupos").DataTable({
            ajax: {
                url: RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php",
                type: "POST",
                data: function (d) {
                    d.accion = CONSULTAR_USUARIOS_GRUPOS;
                    d.idusuario = $("#usuarios").val();
                    d.nombreGrupo = $("#nombreGrupo").val();
                    d.estado = $("#estado").val();
                    d.empresa = $("#empresas").val();
                    d.ordering = d.order[0].column;
                    d.direction = d.order[0].dir;
                },
                dataSrc: "data"
            },
            drawCallback: function (settings) {
                $(".dataTables_empty").attr("colspan", "8");
                spinner(false);
                let div = $('<div/>');
                let button = $('<button/>');
                button.text('+ Nuevo Grupo');
                button.addClass('btn btn-blue');
                button.attr('id', 'addGrupoUsuario');
                div.append(button);
                $('#buttonTable').html(div.html());
                $('#buttonTable').addClass('position-absolute');
                $("#addGrupoUsuario").on("click", function () {
//                    $('.divCalificacion div').removeClass("notAllowed").on('click', function () {
//                        $('.divCalificacion .divSelected').removeClass('divSelected');
//                        $(this).addClass('divSelected');
//                    });
                    $("#tituloModalRegistro").text("Nuevo Grupo Usuario");
                    $("#contenidoModalRegistro").text("A continuacón ingrese la información solicitada para el registro de grupo");
                    limpiar();
//                    $(".contenedorEditar").addClass("oculto");
//                    $("#cargosModal").removeAttr("disabled");
                    $("#registrar").removeClass("oculto");
                    $("#actualizar").addClass("oculto");
                    $('#modalRegistro').modal("show");
                });
                $('#divAncla').html('<label>Ir a la primera fila&nbsp;&nbsp;</label><a href="#irAncla" data-ancla="irAncla"><img class="img-go img ancla" alt=" " /></a>');
                $('#divAncla a').click(function (e) {
                    e.preventDefault();		//evitar el eventos del enlace normal
                    let strAncla = $(this).attr('href'); //id del ancla
                    $('body,html').stop(true, true).animate({
                        scrollTop: $(strAncla).offset().top
                    }, 1000);
                });

                if (tablaUsuarioGrupos !== null) {
                    Array.from(tablaUsuarioGrupos.rows().data()).forEach(usuarioGrupo => {
                        $("#eli_" + usuarioGrupo.idgrupo).off();
                        $("#mod_" + usuarioGrupo.idgrupo).off();
                        $("#verUsuarios" + usuarioGrupo.idgrupo).off();
                        $("#verFlujos" + usuarioGrupo.idgrupo).off();

                        $("#eli_" + usuarioGrupo.idgrupo).click(function () {
                            eliminarGrupo(usuarioGrupo.idgrupo);
                        });
                        $("#mod_" + usuarioGrupo.idgrupo).click(function () {
                            abrirDialogo(usuarioGrupo.idgrupo);
                        });
                        $("#verUsuarios" + usuarioGrupo.idgrupo).click(function () {
                            idGrupo = null;
                            asignacion = false;
                            isEnabled = false;
                            verUsuarios(usuarioGrupo.idgrupo);
                        });
                        $("#verFlujos" + usuarioGrupo.idgrupo).click(function () {
                            idGrupo = null;
                            asignacion = false;
                            isEnabled = false;
                            cargarFlujos(usuarioGrupo.idgrupo);
                        });
                    });
                }
            },
            serverSide: true,
            ordering: true,
            processing: true,
            dom: "<'fondoGris'<'row'<'col-1'><'col-11 col-lg-8 paginateTop paginateCenter'ip><'col-3 d-none d-lg-block lengthTop'l>>><'#buttonTable'><'contenedorTabla'<'row'<'col-12'rt>>><'row fondoGrisAbajo'<'col-1'><'col-9 paginateCenter'ip><'#divAncla'>>",
            autoWidth: false,
            columns: [
                {
                    data: 'idgrupo',
                    class: "text-center br-table-1 w3",
                    render: function (data, type, row) {
                        return `<i id="eli_${row.idgrupo}" class="fas fa-trash-alt cursorPoint iconStyle" title='Eliminar' tabindex="0"></i>`;
                    }
                },
                {
                    data: 'estado',
                    class: "text-center br-table-1 w3",
                    render: function (data, type, row) {
                        if (data === 't') {
                            return `<i class="fas fa-circle iconStyle noHover iconStateTrue" title='estado'></i>`;
                        } else {
                            return `<i class="fas fa-circle iconStyle noHover iconStateFalse" title='estado'></i>`;
                        }
                    }
                },
                {
                    data: 'idgrupo',
                    class: "text-center br-table-1 w3",
                    render: function (data, type, row) {
                        return `<i id="mod_${row.idgrupo}" class="fas fa-pencil-alt iconStyle" title='Modificar' tabindex="0"></i>`;
                    }
                },
                {data: 'idgrupo', class: "text-center w10"},
                {data: 'nombre', class: "text-left w20"},
                {data: 'descripcion', class: "text-left w31"},
                {data: 'totalUsuarios', class: "text-left w15", render: function (data, type, row) {
                        return "<a class='link3' title='Usuarios Vinculados' id='verUsuarios" + row.idgrupo + "'>" + data + " Usuarios vinculados </a>";
                    }
                },
                {data: 'totalFlujos', class: "text-left w15", render: function (data, type, row) {
                        return "<a class='link3' title='Flujos Vinculados' id='verFlujos" + row.idgrupo + "'>" + data + " Flujos vinculados </a>";
                    }
                }
            ],
            columnDefs: [
                {"orderable": false, "targets": [0, 6, 7]}
            ],
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "<label class='pagination-up-label'>Registros por p&aacute;gina</label>" + '<select class="pagination-selector">' +
                        '<option value="10">10</option>' +
                        '<option value="20">20</option>' +
                        '<option value="50">50</option>' +
                        '</select>  ',
                sZeroRecord: "No se encontraron resultados",
                sEmptyTable: "No se encontraron registros",
                sInfo: "_TOTAL_ registros encontrados - P&aacute;gina _PAGE_ de _PAGES_",
                sInfoEmpty: "No se encontraron registros",
                sInfoFiltered: "(Filtrado de un total de _MAX_ registros)",
                sInfoPostFix: "",
                sSearch: "Buscar:",
                sUrl: "",
                sInfoThousands: ",",
                sLoadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                },
                oAria: {
                    sSortAscending: ":Activar para ordenar la columna de manera ascendente",
                    sSortDescending: ":Activar para ordenar la columna de manera descendente"
                }
            },
            lengthMenu: [[10, 20, 50], [10, 20, 50]]
        });
    } else {
        tablaUsuarioGrupos.ajax.reload(null, true);
    }
}

function eliminarGrupo(idGrupo) {
    let data = tablaUsuarioGrupos.row("#" + idGrupo).data();
    jConfirm("Esta seguro de eliminar el grupo " + data.nombre + "?", "Alerta del Sistema", function () {
        let parametros = {accion: ELIMINAR_GRUPO, idgrupo: idGrupo};
        let miCallback = function (callbackParams, result, estado) {
            if (!estado || !result.success) {
                return;
            }
            jAlert("Grupo eliminado con Exito!!!", "Alerta del Sistema", function () {
                tablaUsuarioGrupos.ajax.reload(null, true);
            });
        };
        utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
    });
}

function verUsuarios(idgrupo) {
    idGrupo = idgrupo;
    $('#modalUsuarios').modal("show");
    isEnabled = false;
    cargarUsuarios();
}

function cargarUsuarios() {
    spinner("Consultando usuarios, por favor espere ...");
    if (tablaUsuarios === null) {
        tablaUsuarios = $("#tabla_usuarios").DataTable({
            ajax: {
                url: RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php",
                type: "POST",
                data: function (d) {
                    d.accion = CARGAR_USUARIOS_GRUPO;
                    d.idgrupo = idGrupo;
                    d.asignacion = asignacion;
                    d.empresa = $("#empresas").val();
                },
                dataSrc: "data"
            },
            drawCallback: function (settings) {
                spinner(false);
                $(".dataTables_empty").attr("colspan", "3");
                $("#divNombreUsuario").html("<span>Nombre del Usuario</span>");
                $("#divVincUsers").html("<span>Vincular Usuarios</span>");
                $("#divAsignacion").html("<span>Asignados</span>");
                $(".niveles").html("");

                if (tablaUsuarios !== null) {
                    Array.from(tablaUsuarios.rows().data()).forEach(usuario => {
                        $("#toggle-usuario" + usuario.id_usuario).off();
                        $("#toggle-super-usuario" + usuario.id_usuario).off();

                        $("#toggle-usuario" + usuario.id_usuario).change(function () {
                            asignarUsuario(usuario.id_usuario, usuario.validacion_b);
                        });
                        $("#toggle-super-usuario" + usuario.id_usuario).change(function () {
                            asignarUsuarioSupervisor(usuario.id_usuario, usuario.supervisor_b);
                        });
                    });
                }

                let div = $('<div/>');
                let input = $('<input/>');
                div.addClass('checkbox');
                input.attr({
                    "data-toggle": "toggle",
                    type: "checkbox",
                    "data-on": "Si",
                    "data-off": "No",
                    "data-width": "85px",
                    "data-height": "25px",
                    "data-style": "checkToggle",
                    "data-onstyle": "success",
                    "data-size": "mini",
                    id: 'toggle-niveles',
                    class: 'toggle-rol'
                });
                if (asignacion === true) {
                    input.attr("checked", "checked");
                }
                div.append(input);
                $(".niveles").append(div.html());

                $(".vincularUsuarios").html("");
                let div2 = $('<div/>');
                let input2 = $('<input/>');

                div2.addClass('checkbox');

                input2.attr({
                    "data-toggle": "toggle",
                    type: "checkbox",
                    "data-on": "Si",
                    "data-off": "No",
                    "data-width": "85px",
                    "data-height": "25px",
                    "data-style": "checkToggle",
                    "data-onstyle": "success",
                    "data-size": "mini",
                    id: 'toggle-users',
                    class: 'toggle-rol'
                });

                let allUsersEnabled = allFlujosDisabled = false;

                if (tablaUsuarios !== null) {
                    let usuarios = Array.from(tablaUsuarios.rows().data());
                    let usuariosVinculados = usuarios.filter(obj => obj.validacion_b);

                    allUsersEnabled = usuarios.length === usuariosVinculados.length;
                    allFlujosDisabled = (usuarios.length - usuariosVinculados.length) > 0;
                }

                if (isEnabled || allUsersEnabled) {
                    input2.attr("checked", "checked");
                }

                if (allFlujosDisabled) {
                    input2.removeAttr("checked");
                }


                div2.append(input2);
                $(".vincularUsuarios").append(div2.html());


                $(".toggle-bus[data-bs-toggle='toggle']").bootstrapToggle();
                $(".toggle-rol[data-bs-toggle='toggle']").bootstrapToggle();
                $("#toggle-niveles").change(function () {
                    asignacion = $("#toggle-niveles").prop("checked");
                    cargarUsuarios();
                });
                $("#toggle-users").change(function () {
                    isEnabled = $("#toggle-users").prop("checked");
                    asignarUsuarios();
                });
            },
            processing: true,
            serverSide: false,
            ordering: false,
            bFilter: false,
            searching: true,
            autoWidth: false,
            dom: "<'col-12'<'row'<'col-6 tituloModalTabla'<'#divNombreUsuario'>><'col-3  tituloModalTabla'<'#divVincUsers'>><'col-3 tituloModalTabla'<'#divAsignacion'>>>><'row'<'busquedaDatatable col-6 marginTop'f><'col-3 switchCategorias text-center vincularUsuarios'><'col-3 switchCategorias text-center niveles'>>tr<'fondoGris'<'row row-pagination'<'col-9 paginateTop paginateCenter'ip>>><<'row'<'col-12'rt>>>",
            columns: [
                {data: 'id_usuario', class: "text-center w5", render: function (data, type, row, meta) {
                        let div = $('<div/>');
                        let input = $('<input/>');
                        div.addClass('checkbox');

                        input.attr({
                            "data-toggle": "toggle",
                            type: "checkbox",
                            "data-on": "Si",
                            "data-off": "No",
                            "data-width": "85px",
                            "data-height": "22px",
                            "data-style": "checkToggle",
                            "data-onstyle": "success",
                            "data-size": "mini",
                            id: 'toggle-usuario' + data,
                            class: 'toggle-rol'
                        });
                        if (row.validacion_b === true) {
                            input.attr("checked", "checked");
                        }

                        div.append(input);
                        return div.html();
                    }
                },
                {data: 'nombre', class: "text-left w90", render: function (data, type, row) {
                        return row.nombres + " " + row.apellidos;
                    }
                },
                {data: 'id_usuario', class: "text-center w5", render: function (data, type, row, meta) {
                        if (row.validacion_b === true) {
                            let div = $('<div/>');
                            let input = $('<input/>');
                            div.addClass('checkbox');

                            input.attr({
                                "data-toggle": "toggle",
                                type: "checkbox",
                                "data-on": "Si",
                                "data-off": "No",
                                "data-width": "85px",
                                "data-height": "22px",
                                "data-style": "checkToggle",
                                "data-onstyle": "success",
                                "data-size": "mini",
                                id: 'toggle-super-usuario' + data,
                                class: 'toggle-rol'
                            });
                            if (row.supervisor_b === true) {
                                input.attr("checked", "checked");
                            }
                            div.append(input);
                            return div.html();
                        } else {
                            return "";
                        }
                    }
                }
            ],
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "<label class='pagination-up-label'>Registros por pagina</label>" + '<select class="pagination-selector">' +
                        '<option value="10">10</option>' +
                        '<option value="20">20</option>' +
                        '<option value="50">50</option>' +
                        '</select>  ',
                sZeroRecord: "No se encontraron resultados",
                sEmptyTable: "No se encontraron registros",
                sInfo: "_TOTAL_ registros encontrados - P&aacute;gina _PAGE_ de _PAGES_",
                sInfoEmpty: "No se encontraron registros",
                sInfoFiltered: "(Filtrado de un total de _MAX_ registros)",
                sInfoPostFix: "",
                sSearch: "",
                searchPlaceholder: "Buscar Usuarios",
                sUrl: "",
                sInfoThousands: ",",
                sLoadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                },
                select: {
                    rows: ""
                },
                oAria: {
                    sSortAscending: ":Activar para ordenar la columna de manera ascendente",
                    sSortDescending: ":Activar para ordenar la columna de manera descendente"
                }
            }
        });
    } else {
        tablaUsuarios.ajax.reload(null, true);
    }
}
function asignarUsuario(id, estadoActual) {
    let parametros = {accion: ASIGNAR_USUARIO, idusuario: id, idgrupo: idGrupo, estadoActual: estadoActual};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        tablaUsuarios.ajax.reload(null, false);
        tablaUsuarioGrupos.ajax.reload(null, false);
    };
    spinner("Asignando Usuario, por favor espere ....");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}
function asignarUsuarios() {
    let objDatos = {
        idGrupo: idGrupo,
        usuarios: Array.from(tablaUsuarios.rows().data().map(obj => obj.id_usuario)),
        estadoActual: $("#toggle-users").is(":checked")
    };
    let parametros = {accion: ASIGNAR_USUARIOS, objDatos: JSON.stringify(objDatos)};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        tablaUsuarios.ajax.reload(null, false);
        tablaUsuarioGrupos.ajax.reload(null, false);
    };
    spinner("Asignando Usuario, por favor espere ....");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}

function cargarFlujos(idgrupo) {
    idGrupo = idgrupo;
    spinner("Consultando flujos, por favor espere ...");
    if (tablaFlujos === null) {
        tablaFlujos = $("#tablaFlujos").DataTable({
            ajax: {
                url: RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php",
                type: "POST",
                data: function (d) {
                    d.accion = CARGAR_FLUJOS_GRUPO;
                    d.idgrupo = idGrupo;
                    d.asignacion = asignacion;
                    d.empresa = $("#empresas").val();
                },
                dataSrc: "data"
            },
            processing: true,
            serverSide: false,
            ordering: false,
            bFilter: false,
            searching: true,
            autoWidth: false,
            dom: "<'col-12'<'row'<'col-6 tituloModalTabla'<'#divNombreFlujo'>><'col-3  tituloModalTabla'<'#divVincFlujos'>><'col-3 tituloModalTabla'<'#divAsignacionFlujos'>>>><'row'<'busquedaDatatable col-6 marginTop'f><'col-3 switchCategorias text-center vincularFlujos'><'col-3 switchCategorias text-center flujos-asignados'>>tr<'fondoGris'<'row row-pagination'<'col-9 paginateTop paginateCenter'ip>>><<'row'<'col-12'rt>>>",
            columns: [
                {data: 'idflujodocumental', class: "text-center w5", render: function (data, type, row, meta) {
                        let div = $('<div/>');
                        let input = $('<input/>');
                        div.addClass('checkbox');

                        input.attr({
                            "data-toggle": "toggle",
                            type: "checkbox",
                            "data-on": "Si",
                            "data-off": "No",
                            "data-width": "85px",
                            "data-height": "22px",
                            "data-style": "checkToggle",
                            "data-onstyle": "success",
                            "data-size": "mini",
                            id: 'toggle-flujo' + data,
                            class: 'toggle-rol'
                        });
                        if (row.validacion_b === true) {
                            input.attr("checked", "checked");
                        }
                        div.append(input);
                        return div.html();
                    }
                },
                {data: 'nombre', class: "text-left w95"}
            ],
            drawCallback: function (settings) {
                $('#modalFlujos').modal("show");
                spinner(false);
                $(".dataTables_empty").attr("colspan", "2");
                $("#divNombreFlujo").html("<span>Nombre del Flujo</span>");
                $("#divVincFlujos").html("<span>Vincular Flujos</span>");
                $("#divAsignacionFlujos").html("<span>Asignados</span>");
                $(".flujos-asignados").html("");

                if (tablaFlujos !== null) {
                    Array.from(tablaFlujos.rows().data()).forEach(flujo => {
                        $("#toggle-flujo" + flujo.idflujodocumental).off();

                        $("#toggle-flujo" + flujo.idflujodocumental).change(function () {
                            asignarFlujo(flujo.idflujodocumental, flujo.validacion_b);
                        });
                    });
                }

                let div = $('<div/>');
                let input = $('<input/>');
                div.addClass('checkbox');
                input.attr({
                    "data-toggle": "toggle",
                    type: "checkbox",
                    "data-on": "Si",
                    "data-off": "No",
                    "data-width": "85px",
                    "data-height": "25px",
                    "data-style": "checkToggle",
                    "data-onstyle": "success",
                    "data-size": "mini",
                    id: 'toggle-flujos-asignados',
                    class: 'toggle-rol'
                });
                if (asignacion === true) {
                    input.attr("checked", "checked");
                }
                div.append(input);
                $(".flujos-asignados").append(div.html());

                $(".vincularFlujos").html("");
                let div2 = $('<div/>');
                let input2 = $('<input/>');

                div2.addClass('checkbox');

                input2.attr({
                    "data-toggle": "toggle",
                    type: "checkbox",
                    "data-on": "Si",
                    "data-off": "No",
                    "data-width": "85px",
                    "data-height": "25px",
                    "data-style": "checkToggle",
                    "data-onstyle": "success",
                    "data-size": "mini",
                    id: 'toggle-flujos',
                    class: 'toggle-rol'
                });

                let allFlujosEnabled = allFlujosDisabled = false;

                if (tablaFlujos !== null) {
                    let flujos = Array.from(tablaFlujos.rows().data());
                    let flujosVinculados = flujos.filter(obj => obj.validacion_b);

                    allFlujosEnabled = flujos.length === flujosVinculados.length;
                    allFlujosDisabled = (flujos.length - flujosVinculados.length) > 0;
                }
                if (isEnabled || allFlujosEnabled) {
                    input2.attr("checked", "checked");
                }
                if (allFlujosDisabled) {
                    input2.removeAttr("checked");
                }
                div2.append(input2);
                $(".vincularFlujos").append(div2.html());

                $(".toggle-rol[data-bs-toggle='toggle']").bootstrapToggle();
                $("#toggle-flujos-asignados").change(function () {
                    asignacion = $(this).prop("checked");
                    cargarFlujos(idGrupo);
                });
                $("#toggle-flujos").change(function () {
                    isEnabled = $(this).prop("checked");
                    asignarFlujos();
                });
            },
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "<label class='pagination-up-label'>Registros por pagina</label>" + '<select class="pagination-selector">' +
                        '<option value="10">10</option>' +
                        '<option value="20">20</option>' +
                        '<option value="50">50</option>' +
                        '</select>  ',
                sZeroRecord: "No se encontraron resultados",
                sEmptyTable: "No se encontraron registros",
                sInfo: "_TOTAL_ registros encontrados - P&aacute;gina _PAGE_ de _PAGES_",
                sInfoEmpty: "No se encontraron registros",
                sInfoFiltered: "(Filtrado de un total de _MAX_ registros)",
                sInfoPostFix: "",
                sSearch: "",
                searchPlaceholder: "Buscar Flujos",
                sUrl: "",
                sInfoThousands: ",",
                sLoadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                },
                select: {
                    rows: ""
                },
                oAria: {
                    sSortAscending: ":Activar para ordenar la columna de manera ascendente",
                    sSortDescending: ":Activar para ordenar la columna de manera descendente"
                }
            }
        });
    } else {
        tablaFlujos.ajax.reload(null, true);
    }
}

function asignarFlujo(id, estadoActual) {
    let parametros = {accion: ASIGNAR_FLUJO, idflujo: id, idgrupo: idGrupo, estadoActual};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        tablaFlujos.ajax.reload(null, false);
        tablaUsuarioGrupos.ajax.reload(null, false);
    };
    spinner("Asignando Flujo, por favor espere ....");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}

function asignarFlujos() {
    let datos = {
        idGrupo: idGrupo,
        flujos: Array.from(tablaFlujos.rows().data().map(obj => obj.idflujodocumental)),
        estadoActual: $("#toggle-flujos").is(":checked")
    };
    let parametros = {accion: ASIGNAR_FLUJOS, objDatos: JSON.stringify(datos)};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        tablaFlujos.ajax.reload(null, false);
        tablaUsuarioGrupos.ajax.reload(null, false);
    };
    spinner("Asignando Flujos, por favor espere ....");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}

function asignarUsuarioSupervisor(id, estadoActual) {
    let parametros = {accion: ASIGNAR_USUARIO_SUPERVISOR, idusuario: id, idgrupo: idGrupo, estadoActual: estadoActual};
    let miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        tablaUsuarios.ajax.reload(null, false);
        tablaUsuarioGrupos.ajax.reload(null, false);
    };
    spinner("Asignando Usuario, por favor espere ....");
    utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this, true);
}

function abrirDialogo(idGrupo) {
    limpiar();
    let data = tablaUsuarioGrupos.row("#" + idGrupo).data();
    $("#idGrupo").val(data.idgrupo);
    $("#nombreModal").val(data.nombre);
    $("#descripcionModal").val(data.descripcion);
    $('.divEstados .divSelected').removeClass('divSelected');
    if (data.estado === "t") {
        $(".divEstados .divCheck[estado='true']").addClass('divSelected');
    } else {
        $(".divEstados .divCheck[estado='false']").addClass('divSelected');
    }
    $("#registrar").addClass("oculto");
    $("#actualizar").removeClass("oculto");
    $('#modalRegistro').modal("show");
}

function limpiar() {
    $("#idGrupo").val("");
    $("#nombreModal").val('');
    $("#descripcionModal").val('');
//    $("#notaMinimaModal").val('');
//    $("#numeroIntentosModal").val('');
    $('.divEstados .divSelected').removeClass('divSelected');
    $(".divEstados .divCheck[estado='true']").addClass('divSelected');
//    $('.divCalificacion .divSelected').removeClass('divSelected');
//    $(".divCalificacion .divCheck[calificacion='true']").addClass('divSelected');
//    $("#cargosModal").val('0');
//    $("#adjunto").val("");
//    $("#nombreArchivo").html("");
}

function registrarGrupo() {
    spinner("Registrando Grupo, por favor espere ...");
    setTimeout(function () {
        let parametros = {accion: REGISTRAR_GRUPO, datos: objDatosRegistro};
        let miCallback = function (callbackParams, result, estado) {
            spinner(false);
            if (!estado || !result.success) {
                return;
            }
//            $("#modalEvaluacion").modal("hide");
//            $("#adjunto").val("");
//            $("#archivoAdjunto").val("");
            jAlert("Proceso Realizado con exito !!!", "Alerta del Sistema", function () {
                limpiar();
                $('#modalRegistro').modal("hide");
                if (tablaUsuarioGrupos !== null) {
                    tablaUsuarioGrupos.ajax.reload(null, true);
                }
            });
        };
        utilidadesjQuery.ajax(RUTA_DSR_REL + RUTA_DSR + "AdministracionUsuariosGrupos.php", parametros, miCallback, null, this);
    }, 500);
}

function validarDatosRegistro() {
    objDatosRegistro.idgrupo = $("#idGrupo").val();
    objDatosRegistro.nombre = $("#nombreModal").val();
    objDatosRegistro.descripcion = $("#descripcionModal").val();
    objDatosRegistro.estado = $(".divEstados").find('.divSelected').attr("estado");
    objDatosRegistro.empresa = $("#empresas").val();
    let errores = [];
    let validarNombre = /["'<>{}$%&(/#]/g.test(objDatosRegistro.nombre);
    if (validarNombre) {
        errores.push({
            msg: 'El nombre contiene caracteres inv&aacute;lidos',
            accion: function () {
                $("#nombreModal").focus();
            }
        });
    }
    if (objDatosRegistro.nombre.length > 40) {
        errores.push({
            msg: 'El nombre debe tener como maximo 40 caracteres',
            accion: function () {
                $("#nombreModal").focus();
            }
        });
    }
    if (objDatosRegistro.nombre === "") {
        errores.push({
            msg: 'El nombre es obligatorio',
            accion: function () {
                $("#nombreModal").focus();
            }
        });
    }
    let validarDescripcion = /["'<>{}$%&(/#]/g.test(objDatosRegistro.descripcion);
    if (validarDescripcion) {
        errores.push({
            msg: 'La descripcion contiene caracteres inv&aacute;lidos',
            accion: function () {
                $("#descripcionModal").focus();
            }
        });
    }
    if (objDatosRegistro.descripcion.length > 255) {
        errores.push({
            msg: 'La descripcion debe tener como maximo 255 caracteres',
            accion: function () {
                $("#descripcionModal").focus();
            }
        });
    }
    if (objDatosRegistro.descripcion === "") {
        errores.push({
            msg: 'La descripcion es obligatoria',
            accion: function () {
                $("#descripcionModal").focus();
            }
        });
    }

    toastr.remove();
    if (errores.length > 0) {
        for (let i = 0; i < errores.length; i++) {
            let optionsToast = {
                removeToast: false,
                onclick: errores[i].accion
            }
            newToast("warning", errores[i].msg, "Advertencia", optionsToast, 'toast-custom');
        }
        return;
    }

    return true;
}