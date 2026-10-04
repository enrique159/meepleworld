import 'package:go_router/go_router.dart';

import '../layouts/main_layout.dart';
import '../navigation/main_section.dart';
import '../views/home_view.dart';
import '../views/marketplace_view.dart';
import '../views/messages_view.dart';
import '../views/profile_view.dart';
import '../views/tables_view.dart';
import 'app_routes.dart';

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: AppRoutes.home,
    routes: [
      // Vistas provisionales. La sesión y el layout de acceso están pendientes.
      ShellRoute(
        pageBuilder: (context, state, child) => NoTransitionPage<void>(
          key: state.pageKey,
          child: MainLayout(
            selectedSection: MainSection.fromPath(state.uri.path),
            onSectionSelected: (section) => context.go(section.path),
            child: child,
          ),
        ),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: AppRoutes.homeName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const HomeView(),
            ),
          ),
          GoRoute(
            path: AppRoutes.tables,
            name: AppRoutes.tablesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const TablesView(),
            ),
          ),
          GoRoute(
            path: AppRoutes.marketplace,
            name: AppRoutes.marketplaceName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MarketplaceView(),
            ),
          ),
          GoRoute(
            path: AppRoutes.messages,
            name: AppRoutes.messagesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MessagesView(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: AppRoutes.profileName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const ProfileView(),
            ),
          ),
        ],
      ),
    ],
  );
}
