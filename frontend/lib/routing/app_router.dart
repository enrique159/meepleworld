import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import '../layouts/main_layout.dart';

abstract final class AppRoutes {
  static const home = '/';
  static const homeName = 'home';
}

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: AppRoutes.home,
    routes: [
      // Vista provisional del layout. La sesión y el layout de acceso están pendientes.
      ShellRoute(
        pageBuilder: (context, state, child) => NoTransitionPage<void>(
          key: state.pageKey,
          child: MainLayout(child: child),
        ),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: AppRoutes.homeName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const SizedBox.expand(),
            ),
          ),
        ],
      ),
    ],
  );
}
