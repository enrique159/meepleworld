import 'package:hugeicons/hugeicons.dart';

import '../routing/app_routes.dart';

enum MainSection {
  home('Inicio', AppRoutes.home, HugeIcons.strokeRoundedHome02),
  tables('Mesas', AppRoutes.tables, HugeIcons.strokeRoundedTableRound),
  marketplace(
    'Marketplace',
    AppRoutes.marketplace,
    HugeIcons.strokeRoundedStore01,
  ),
  messages(
    'Mensajes',
    AppRoutes.messages,
    HugeIcons.strokeRoundedMessageSquare,
  ),
  profile('Mi Perfil', AppRoutes.profile, HugeIcons.strokeRoundedUser);

  const MainSection(this.label, this.path, this.icon);

  final String label;
  final String path;
  final List<List<dynamic>> icon;

  static MainSection fromPath(String path) =>
      values.firstWhere((section) => section.path == path, orElse: () => home);
}
