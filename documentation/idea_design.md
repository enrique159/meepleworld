# MeepleWorld: idea y diseño del producto

Estado: definición de producto; backend inicial implementado y frontend Flutter con layout principal y navegación entre cinco vistas provisionales. Última actualización: 2 de octubre de 2026.

Este documento es la referencia de producto para la primera versión. La arquitectura prevista y las instrucciones de desarrollo están en las [reglas del backend](../.github/backend/rules.md) y las [reglas del frontend](../.github/frontend/rules.md), reunidas en el [índice técnico](../.github/agent_instructions.md); la presentación general está en el [README](../README.md).

## 1. Visión y propósito

MeepleWorld busca convertir el interés por los juegos de mesa en oportunidades reales para jugar y conocer personas. Permitirá encontrar encuentros cercanos, ofrecer lugares en una mesa propia y descubrir juegos que otros miembros de la comunidad poseen. Su marketplace facilitará encontrar compradores y conseguir juegos, incluyendo publicaciones de búsqueda.

El público inicial incluye aficionados que necesitan completar un grupo, personas que quieren socializar, quienes desean conocer nuevos juegos y coleccionistas que compran o venden juegos de mesa.

El lanzamiento se enfocará en ciudades de México, con interfaz en español y cantidades en pesos mexicanos (MXN). Habrá aplicaciones móviles para Android e iOS desarrolladas con Flutter. La web queda fuera del alcance. La primera versión requerirá conexión para consultar datos actualizados y realizar acciones.

La utilidad principal será conseguir encuentros y conexiones entre jugadores. Las publicaciones generales de una red social y las relaciones de amistad serán ampliaciones futuras.

El acceso a toda la plataforma requerirá una cuenta activa, correo verificado e inicio de sesión. Esta regla incluye explorar mesas y anuncios, usar el mapa, consultar el catálogo y ver perfiles. Sin sesión solo estarán disponibles los flujos necesarios para registrarse, iniciar sesión, verificar el correo y recuperar la cuenta. No habrá navegación de contenido como visitante.

## 2. Conceptos y actores

| Concepto | Significado |
| --- | --- |
| Mesa | Encuentro presencial para jugar, con anfitrión, ubicación, horario y lugares disponibles. |
| Anfitrión | Usuario que publica y administra una mesa. Es un rol en ese encuentro, no un tipo de cuenta separado. |
| Titular de la solicitud | Usuario que solicita asistencia para sí mismo y, opcionalmente, acompañantes. |
| Acompañante | Persona sin participación propia mediante una cuenta en esa solicitud; ocupa un lugar y queda representada por el titular. |
| Biblioteca | Juegos registrados en la cuenta, de forma manual o mediante importación de BGG. |
| Anuncio de venta | Publicación de un usuario que ofrece un juego. |
| Anuncio de búsqueda | Publicación de un usuario que quiere conseguir un juego y permite recibir ofertas. |
| Administrador | Cuenta con permisos para atender reportes, retirar contenido y suspender cuentas. |

La misma cuenta podrá organizar mesas, asistir a otras y participar en el marketplace.

Los permisos de usuarios, anfitriones, autores y administradores requieren una cuenta activa con correo verificado y sesión válida. En MeepleWorld, «público» significa visible para la comunidad autenticada; no implica acceso anónimo. La visibilidad pública de las colecciones de BGG corresponde a ese servicio externo.

| Acción | Persona sin sesión | Usuario autenticado | Anfitrión o autor | Administrador |
| --- | --- | --- | --- | --- |
| Explorar mesas y anuncios | No | Sí | Sí | Sí |
| Consultar catálogo y perfiles de la comunidad | No | Sí | Sí | Sí |
| Consultar dirección pública de una mesa | No | Sí | Sí | Sí |
| Consultar dirección privada | No | Solo si está confirmado en esa mesa | Sí, en su propia mesa | Solo para una revisión autorizada |
| Publicar, solicitar asistencia y usar chat | No | Sí, según contexto | Sí | Según contexto |
| Editar mesa, resolver solicitudes o cerrar anuncio | No | No, salvo que sea el autor | Sí, en su contenido | Puede intervenir para moderar |
| Calificar | No | Solo con una experiencia habilitada | Solo con una experiencia habilitada | Puede moderar calificaciones |

Los perfiles visibles para otros usuarios autenticados mostrarán nombre visible, avatar, ciudad y reputación. El correo, las credenciales y la ubicación personal precisa no formarán parte de ese perfil compartido.

## 3. Primera versión

La primera versión incluirá cuentas y perfiles, biblioteca, mesas con mapa y listado, asistencia con acompañantes, marketplace, chat, notificaciones internas y push móvil, reportes, bloqueo y reputación. Los pagos se acordarán fuera de MeepleWorld y no habrá comisiones ni procesamiento de pagos en este alcance.

### 3.1. Cuentas y biblioteca

El usuario se registrará con correo y contraseña e iniciará sesión con el correo verificado antes de acceder a cualquier contenido de la plataforma. En producción deberá confirmar su correo mediante un enlace de verificación. Si el backend no está en producción, el correo quedará verificado automáticamente en el momento de crear la cuenta, sin generar token ni enviar correo de verificación; podrá iniciar sesión inmediatamente después del registro.

La regla depende del entorno del backend: producción exige confirmación por correo y los entornos de desarrollo y pruebas verifican automáticamente las cuentas nuevas. La creación de una cuenta no inicia sesión por sí sola. Podrá reenviar la verificación cuando sea necesaria y recuperar el acceso mediante correo sin una sesión iniciada. Una cuenta sin verificar o suspendida no podrá entrar a la plataforma.

La app comprobará la sesión antes de abrir las vistas de producto, incluidos los enlaces a mesas, anuncios o perfiles. Podrá restaurarla mediante una credencial de renovación válida. Al cerrar sesión o cuando no pueda renovarse por expiración o revocación, volverá al flujo de acceso y retirará los datos de la cuenta y del contenido protegido de su estado local. La API exigirá autenticación también en las consultas de lectura.

La biblioteca permitirá agregar y retirar juegos manualmente. Podrá registrar nombre, imagen y datos útiles como rango de jugadores y duración, cuando estén disponibles. Un juego podrá elegirse al preparar una mesa o identificarlo en un anuncio. No será obligatorio usar BGG para aprovechar la plataforma.

Para importar una colección, el usuario indicará un nombre de usuario de BGG y solicitará la importación de sus juegos marcados como poseídos y visibles públicamente. Podrá repetir la importación de manera explícita; no habrá sincronización periódica ni escritura de cambios en BGG.

La importación reutilizará los juegos ya identificados por BGG, conservará los registros manuales y no eliminará juegos de la biblioteca por su ausencia en una importación posterior. Los registros manuales sin identificador BGG no se fusionarán automáticamente solo por tener el mismo nombre. Una importación fallida conservará la biblioteca anterior y permitirá reintentar. Indicar un usuario BGG no acredita que la persona sea titular de esa cuenta.

El uso de BGG dependerá de la aprobación de la aplicación y sus credenciales. El registro manual seguirá disponible si la integración no está configurada o falla. Estos requisitos se detallan en las [reglas del backend](../.github/backend/rules.md#boardgamegeek).

### 3.2. Publicación de mesas

| Información | Regla de producto |
| --- | --- |
| Título y descripción | Explican el encuentro y qué puede esperar un asistente. |
| Juegos propuestos | Uno o varios juegos de la biblioteca del anfitrión. |
| Fecha, hora y zona horaria | Horario local del lugar del encuentro; podrá añadirse una duración estimada. |
| Ciudad y ubicación | Ciudad, dirección y punto de encuentro. |
| Personas que ya participan | Incluyen al anfitrión y a su grupo inicial; ya ocupan lugares. |
| Lugares ofrecidos | Lugares adicionales que se publican para miembros de MeepleWorld. |
| Tipo de acceso | Asistencia abierta o sujeta a aprobación del anfitrión. |
| Privacidad de dirección | Visible para todos los usuarios autenticados (pública) o exclusiva para asistentes confirmados. |
| Cuota | Gratuita o cantidad positiva en MXN por persona; cobro acordado con el anfitrión. |
| Amenidades | Por ejemplo, aire acondicionado, bebidas, aperitivos, estacionamiento o baño. |
| Instrucciones | Indicaciones de llegada, experiencia requerida y acuerdos del encuentro. |

El grupo inicial y los lugares ofrecidos se distinguirán para evitar confundir el tamaño total con el cupo disponible. Por ejemplo, cuatro personas iniciales y cuatro lugares ofrecidos equivalen a ocho personas como máximo. Las confirmaciones recibidas mediante la app descuentan lugares del cupo ofrecido.

El anfitrión podrá editar la mesa antes de su inicio, pero no reducir su capacidad por debajo de los lugares ya confirmados. Los cambios en horario, ubicación, cuota o condiciones importantes generarán avisos a los asistentes confirmados y titulares con solicitudes vigentes.

### 3.3. Descubrimiento y privacidad

Las mesas se mostrarán en un mapa con Mapbox y en un listado que mantendrán los mismos filtros. Se podrá buscar por ciudad o cercanía, fecha, juego, lugares disponibles y cuota. Una mesa llena podrá consultarse, pero no admitir nuevas solicitudes ni incorporaciones mientras no se liberen lugares.

La ubicación del dispositivo se solicitará cuando sirva para buscar cerca. Si el usuario la deniega o no está disponible, podrá elegir una ciudad manualmente y seguir usando mapa y listado. No habrá seguimiento continuo de su ubicación.

Cuando la dirección sea pública, los usuarios autenticados podrán consultar el punto exacto. Cuando sea privada, los usuarios autenticados sin permiso para verla recibirán la ciudad y una ubicación aproximada, identificada como tal. El punto exacto, la dirección y las instrucciones privadas solo estarán disponibles para el anfitrión y asistentes confirmados, salvo una revisión administrativa autorizada. Una solicitud pendiente o una oferta parcial todavía no aceptada no otorgarán acceso. Sin sesión no se expondrá ninguna de estas consultas.

La aproximación se generará de manera consistente para la mesa y no enviará el punto exacto oculto al dispositivo. Distancias, filtros, marcadores y avisos compartidos con la comunidad autenticada utilizarán esa ubicación aproximada para evitar revelar la posición privada. Tras cancelar una participación, el usuario perderá acceso a nuevos datos privados; la app retirará los datos privados de su estado local.

### 3.4. Asistencia y acompañantes

Cada solicitud indicará un número entero de lugares: uno para el titular más sus acompañantes. El mínimo será uno. El titular verá y administrará la participación de su grupo; los acompañantes sin cuenta no tendrán chat, notificaciones ni reputación propios. Podrán asistir representados por el titular, pero necesitarán su propia cuenta e inicio de sesión si quieren acceder a la plataforma.

| Modalidad | Confirmación |
| --- | --- |
| Mesa abierta | El botón **Asistir** confirma al grupo completo cuando hay lugares suficientes. Si no cabe, informa del cupo actual y permite elegir una cantidad menor antes de volver a intentar. |
| Mesa con aprobación completa | El anfitrión aprueba la cantidad solicitada y el grupo se confirma si todavía hay cupo suficiente. |
| Mesa con aprobación parcial | El anfitrión ofrece una cantidad positiva menor que la solicitada. El titular acepta o rechaza; aceptar vuelve a comprobar el cupo antes de confirmar. |

Las solicitudes pendientes y las ofertas parciales no reservarán lugares. Si una oferta pierde disponibilidad antes de aceptarse, la app informará del conflicto y la participación no quedará confirmada; el anfitrión podrá revisar la oferta. No se asignará automáticamente una cantidad inferior a la aceptada.

No se permitirán dos participaciones vigentes de la misma cuenta en una mesa. Repetir una acción por un doble toque o un reintento de conexión no ocupará lugares adicionales. El anfitrión ya forma parte del grupo inicial y no solicitará lugares en su propia mesa.

El titular podrá cancelar todo su grupo antes del inicio y liberar los lugares confirmados. Para cambiar la cantidad de una participación confirmada, cancelará y realizará una nueva solicitud; esa nueva solicitud dependerá del cupo y de la modalidad vigente. El anfitrión podrá rechazar solicitudes o retirar una confirmación con aviso al titular. Cancelar una mesa cerrará sus solicitudes y participaciones e impedirá nuevas incorporaciones.

Al llegar la hora de inicio se cerrarán las incorporaciones y vencerán solicitudes y ofertas pendientes. Las mesas finalizadas, canceladas o retiradas por moderación no aceptarán asistentes.

### 3.5. Marketplace

Los anuncios de venta incluirán juego, descripción, fotografías, condición del ejemplar, precio en MXN y ciudad. Los anuncios de búsqueda incluirán el juego deseado, descripción, condición aceptable y presupuesto opcional. Se podrá publicar un anuncio sin que el juego pertenezca a la biblioteca personal, utilizando el catálogo o un registro manual.

Un interesado iniciará un chat asociado al anuncio. En una búsqueda, otro usuario podrá ofrecer su ejemplar mediante esa conversación. Se podrá consultar por juego, ubicación, tipo de anuncio, condición y precio o presupuesto cuando exista.

El autor podrá editar y cerrar su anuncio; un anuncio de venta podrá marcarse como vendido y uno de búsqueda como resuelto. Los anuncios cerrados dejarán de recibir nuevas conversaciones. Cerrar un anuncio no acreditará por sí mismo una compraventa.

Para habilitar reputación por una operación, una parte propondrá su confirmación desde una conversación y la otra deberá confirmarla. El registro identificará el anuncio, comprador y vendedor; en un anuncio de búsqueda, el autor será el comprador. Esa confirmación es una declaración de ambas partes y no una verificación de pago por MeepleWorld.

Pago, entrega, envío y cualquier devolución se acordarán entre los participantes. La app no reservará dinero ni procesará cuotas de mesas o pagos de juegos.

### 3.6. Chat y notificaciones

Habrá conversaciones privadas entre el autor de un anuncio y cada interesado. No se publicará información de contacto personal como requisito para conversar.

Cada mesa tendrá un chat grupal disponible para el anfitrión y titulares confirmados. Las solicitudes pendientes y acompañantes sin cuenta no podrán entrar. Cancelar o retirar una participación revocará el acceso al chat, incluida su recepción de nuevos mensajes. Al finalizar el encuentro, su chat quedará como historial de solo lectura para quienes conserven acceso.

La aplicación incluirá un centro de notificaciones y notificaciones push en Android e iOS para solicitudes, aprobaciones, ofertas parciales, cambios, cancelaciones y mensajes. El correo se utilizará para verificación en producción y recuperación de acceso. El usuario podrá administrar permisos y preferencias de push.

Denegar push no impedirá usar la app: los avisos seguirán disponibles en el centro de notificaciones. Un fallo de push no deshará una confirmación de asistencia. Las vistas previas de notificaciones no mostrarán direcciones privadas ni el contenido de mensajes privados; abrir el aviso requerirá comprobar nuevamente el acceso al contenido.

### 3.7. Reputación y convivencia

Anfitrión y titulares que permanezcan confirmados al finalizar una mesa podrán calificarse entre sí con una puntuación de 1 a 5 y comentario. El sistema registrará participación confirmada, sin afirmar que verificó físicamente la asistencia. Una mesa cancelada no habilitará calificaciones. Los acompañantes sin cuenta no recibirán evaluaciones individuales.

En el marketplace, comprador y vendedor podrán calificarse tras confirmar ambos la operación. Una conversación o una confirmación unilateral no bastarán. Se admitirá una calificación por autor, destinatario y experiencia; nadie podrá calificarse a sí mismo. La reputación de mesas y la de compraventa se mostrarán por separado, con promedio y cantidad de calificaciones, para dar contexto.

Se podrán reportar usuarios, mesas, anuncios, mensajes y calificaciones. Los administradores tendrán una vista básica para revisar reportes y su contexto, retirar contenido, suspender cuentas y registrar el motivo de su intervención. El acceso administrativo a información privada se limitará a revisiones autorizadas y quedará registrado.

Bloquear a una persona impedirá nuevas conversaciones privadas y nuevas solicitudes de asistencia entre ambos usuarios. El bloqueo no cancelará automáticamente reservas existentes ni expulsará de un chat grupal compartido: el usuario podrá cancelar su participación, el anfitrión retirarla o solicitar intervención administrativa. Los reportes seguirán disponibles en esos encuentros.

Una cuenta suspendida no podrá acceder al contenido ni realizar acciones en la plataforma, incluidas las consultas de lectura. Su contenido activo se ocultará del descubrimiento; sus mesas no admitirán nuevas confirmaciones y se avisará a los participantes afectados. La administración resolverá las participaciones existentes mediante las acciones de cancelación correspondientes.

## 4. Estados principales

Estos estados describen el comportamiento esperado; sus nombres de código se definirán en los contratos de implementación.

| Elemento | Estados y comportamiento |
| --- | --- |
| Mesa | Borrador → publicada → en curso → finalizada. Puede cancelarse; moderación puede retirarla. Solo una mesa publicada, antes del inicio, admite incorporaciones. |
| Disponibilidad | Disponible o llena, calculada a partir del cupo ofrecido y los lugares confirmados; no es un estado independiente de la mesa. |
| Solicitud | Pendiente → confirmada o rechazada; pendiente → oferta parcial → confirmada tras aceptación con cupo. Puede cancelarse, retirarse o vencer al inicio. |
| Anuncio de venta | Borrador → activo → vendido o cerrado; puede retirarse por moderación. |
| Anuncio de búsqueda | Borrador → activo → resuelto o cerrado; puede retirarse por moderación. |
| Confirmación de operación | Pendiente de la otra parte → confirmada por ambas o rechazada. Solo la confirmación bilateral habilita reputación. |
| Importación BGG | Pendiente → en proceso → completada o fallida; puede reintentarse sin duplicar juegos. |
| Reporte | Pendiente → en revisión → resuelto, con motivo y acción registrada. |

## 5. Recorridos de usuario

Todos los recorridos de producto comienzan con una sesión válida de una cuenta activa y verificada. Si el usuario ya tiene cuenta, iniciará sesión o la app restaurará su sesión vigente; si no la tiene, deberá registrarse e iniciar sesión. En producción confirmará previamente el correo; fuera de producción el backend lo verificará automáticamente al crear la cuenta.

### Organizar una mesa

1. Crear la cuenta si hace falta, confirmar el correo si el backend está en producción, iniciar sesión y preparar la biblioteca.
2. Elegir juegos, ciudad, fecha y hora; registrar el grupo inicial y lugares adicionales.
3. Definir amenidades, cuota, modalidad de asistencia y privacidad de la dirección.
4. Publicar y revisar solicitudes; aprobarlas o proponer menos lugares según corresponda.
5. Coordinar el encuentro en el chat, avisar de cambios y finalizarlo después de jugar.

### Encontrar con quién jugar

1. Crear la cuenta si hace falta, confirmar el correo si el backend está en producción e iniciar sesión.
2. Explorar por ciudad o permitir geolocalización; alternar entre mapa y listado.
3. Consultar juegos, horario, condiciones, cupo y reputación del anfitrión.
4. Elegir lugares para sí mismo y sus acompañantes.
5. Confirmar directamente o esperar resolución del anfitrión; aceptar una oferta parcial si resulta adecuada.
6. Consultar la dirección y el chat al quedar confirmado; cancelar si no podrá asistir.
7. Calificar al anfitrión después de que la mesa finalice, cuando conserve participación confirmada.

### Comprar o conseguir un juego

1. Crear la cuenta si hace falta, confirmar el correo si el backend está en producción e iniciar sesión.
2. Buscar un anuncio de venta o publicar una búsqueda.
3. Conversar sobre condición, precio y entrega mediante el chat del anuncio.
4. Acordar y concretar la operación fuera de MeepleWorld.
5. Confirmar la operación con la otra parte y cerrar el anuncio cuando corresponda.
6. Calificar la experiencia una vez confirmada por ambos participantes.

## 6. Ejemplo de mesa

Una persona publica: **«Viernes de Códigos secretos y otros juegos»**, para el viernes a las **8:00 p. m.**, usando la zona horaria de su ciudad. Su biblioteca contiene los juegos propuestos. Indica que ya son **cuatro personas**, incluido el anfitrión, y ofrece **cuatro lugares adicionales**. La mesa es gratuita, cuenta con aire acondicionado, bebidas y aperitivos, requiere aprobación y mantiene la dirección privada.

Un usuario solicita **tres lugares**: uno para él y dos acompañantes. Mientras espera, otro usuario consigue la aprobación de **dos lugares**, por lo que quedan dos disponibles. El anfitrión ofrece **dos lugares** al primer usuario, quien acepta la reducción. Si esos lugares siguen libres, su participación queda confirmada y la mesa se llena. El total será de ocho personas.

Si antes de aceptar otra participación ocupa uno de los lugares, la aceptación fallará por falta de cupo. El usuario recibirá el aviso y podrá conversar con el anfitrión sobre una nueva oferta. No se le confirmará un único lugar automáticamente. La dirección privada y el chat solo se habilitarán después de una confirmación exitosa.

## 7. Criterios de aceptación

| Escenario | Resultado esperado |
| --- | --- |
| Persona sin sesión abre la app o un enlace a contenido | Accede al flujo de cuenta; no puede ver mesas, anuncios, catálogo, mapa ni perfiles hasta iniciar sesión con una cuenta activa y verificada. |
| Consulta directa a un endpoint de producto sin autenticación válida | La API responde `401` sin entregar contenido, incluso en listados, detalles y perfiles. |
| Se crea una cuenta con el backend fuera de producción | El correo queda verificado al crearla, sin token ni envío de verificación; el usuario puede iniciar sesión inmediatamente con sus credenciales. |
| Se crea una cuenta con el backend en producción | El correo queda sin verificar y el usuario debe confirmar el enlace enviado antes de iniciar sesión. |
| Cuenta sin verificar o suspendida intenta acceder | Se impide el acceso al contenido y a las acciones de producto. |
| Se cierra sesión o no puede renovarse una sesión expirada o revocada | La app vuelve al flujo de acceso, retira los datos protegidos de su estado local y deja de recibir eventos de la cuenta. |
| Usuario autenticado consulta una dirección pública | Puede ver el punto exacto; una dirección privada sigue requiriendo permiso de anfitrión, asistente confirmado o revisión administrativa autorizada. |
| Acompañante sin cuenta | Puede asistir representado por el titular, pero no acceder a la plataforma. |
| Dos usuarios intentan ocupar el último lugar simultáneamente | Solo uno confirma; el otro recibe el cupo actualizado. Nunca hay sobreocupación. |
| Se repite una confirmación por un problema de conexión | Se mantiene una sola participación y un solo descuento de lugares. |
| Se acepta una oferta parcial que ya no cabe | No se confirma ni se cambia la cantidad silenciosamente; se informa del conflicto. |
| Se cancela un grupo confirmado antes del inicio | Se liberan todos sus lugares una sola vez y se revocan dirección privada y chat. |
| Se cancela una mesa | Se cierran incorporaciones y solicitudes, se avisa a los afectados y no se habilitan calificaciones. |
| Dirección privada y solicitud pendiente | Mapa, listado, respuestas y avisos del usuario autenticado contienen solo ubicación aproximada y datos compartidos con la comunidad. |
| Geolocalización denegada | Se puede seleccionar ciudad y usar mapa y listado. |
| BGG falla o todavía no está habilitado | Biblioteca anterior intacta, registro manual disponible y estado de importación comprensible. |
| Se importa dos veces la misma colección | No se duplican juegos con el mismo identificador BGG ni asociaciones de biblioteca. |
| Se retira un asistente del chat | El servidor impide leer historial y recibir o enviar nuevos mensajes de esa mesa. |
| Push está desactivado o falla | La operación se conserva y el aviso permanece dentro de la aplicación. |
| Se quiere calificar una solicitud pendiente o una venta sin confirmar | La evaluación se rechaza hasta que exista una experiencia habilitada. |
| Una cuenta bloqueada intenta abrir un nuevo chat privado | La operación se impide; los reportes siguen disponibles. |

## 8. Evolución y pendientes

La exigencia de sesión para toda la plataforma es una decisión de producto pendiente de aplicar por completo. El backend inicial todavía permite consultas anónimas de perfiles, catálogo, mesas y anuncios; deberán protegerse y actualizarse en el contrato OpenAPI al implementar el cambio. El frontend aún no implementa el flujo de acceso ni el contenido de producto. Por autorización del responsable, la ruta `/` abre provisionalmente Inicio en el layout principal, con el fondo radial aprobado y un menú inferior flotante para Inicio, Mesas, Marketplace, Mensajes y Mi Perfil. Cada sección tiene una ruta y una vista provisional con su título identificador; el menú resalta la sección activa con un círculo blanco. No consume contenido de la API ni representa una sesión autenticada. El layout de autenticación y las redirecciones según sesión se implementarán después.

La verificación automática de cuentas nuevas fuera de producción también está pendiente de implementación y actualización del contrato de registro. El backend inicial aún crea cuentas con correo sin verificar y genera su mensaje de verificación en todos los entornos que admite.

Las etapas siguientes podrán incorporar publicaciones sociales, amistades, comentarios públicos, lista de espera, sincronización automática con BGG, pagos integrados y expansión a otros países o idiomas. Estas funciones no forman parte de la primera versión y requerirán una definición propia antes de implementarse.

Quedan pendientes los proveedores de hosting del backend, almacenamiento de imágenes, correo y push; las credenciales externas; la aprobación de BGG; el resto de la identidad visual y las fechas de lanzamiento. El responsable está preparando las pantallas; están autorizados el layout principal, su fondo radial, las rutas de las cinco vistas provisionales y sus títulos identificadores, el menú flotante con HugeIcons y su contenedor de vidrio reutilizable (blanco al 30%, blur de 8 px y borde de 1 px con degradado `#F1E7FC` → `#DFC7FE`). El contenido de las pantallas y los demás componentes, estilos, temas y animaciones esperarán al diseño correspondiente. La primera versión documentada incluye esas integraciones donde corresponden, aunque aún no estén disponibles sus servicios.

Como indicadores iniciales de utilidad se propone observar mesas publicadas, solicitudes que terminan confirmadas, mesas finalizadas, operaciones declaradas por ambas partes y recurrencia de usuarios. No se fijan metas numéricas hasta contar con datos de uso.
