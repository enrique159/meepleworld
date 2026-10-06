import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:meepleworld/features/auth/data/models/registration_result.dart';
import 'package:meepleworld/features/auth/data/repositories/auth_repository.dart';
import 'package:meepleworld/features/auth/presentation/screens/session_screen.dart';
import 'package:meepleworld/features/auth/presentation/screens/sign_in_screen.dart';
import 'package:meepleworld/features/auth/presentation/screens/sign_up_screen.dart';
import 'package:meepleworld/features/auth/presentation/view_models/auth_session_view_model.dart';
import 'package:meepleworld/features/auth/presentation/view_models/sign_in_view_model.dart';
import 'package:meepleworld/features/auth/presentation/view_models/sign_up_view_model.dart';
import 'package:meepleworld/features/home/presentation/screens/home_screen.dart';
import 'package:meepleworld/features/marketplace/presentation/screens/marketplace_screen.dart';
import 'package:meepleworld/features/messages/presentation/screens/messages_screen.dart';
import 'package:meepleworld/features/profile/presentation/screens/profile_screen.dart';
import 'package:meepleworld/features/tables/presentation/screens/tables_screen.dart';

import '../shell/auth_shell.dart';
import '../shell/main_shell.dart';
import '../shell/navigation/main_section.dart';
import 'app_routes.dart';

GoRouter createAppRouter({
  required AuthRepository auth,
  required AuthSessionViewModel session,
}) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    refreshListenable: session,
    redirect: (context, state) {
      final path = state.uri.path;
      final isAuth = path.startsWith('/auth/');
      if (!session.initialized) {
        return path == AppRoutes.session ? null : AppRoutes.session;
      }
      if (!session.isAuthenticated) {
        return isAuth && path != AppRoutes.session ? null : AppRoutes.signIn;
      }
      return isAuth ? AppRoutes.home : null;
    },
    routes: [
      ShellRoute(
        pageBuilder: (context, state, child) => NoTransitionPage<void>(
          key: state.pageKey,
          child: AuthShell(child: child),
        ),
        routes: [
          GoRoute(
            path: AppRoutes.session,
            builder: (context, state) => SessionScreen(session: session),
          ),
          GoRoute(
            path: AppRoutes.signUp,
            builder: (context, state) =>
                SignUpScreen(createViewModel: () => SignUpViewModel(auth)),
          ),
          GoRoute(
            path: AppRoutes.signIn,
            builder: (context, state) {
              final result = state.extra is RegistrationResult
                  ? state.extra as RegistrationResult
                  : null;
              return SignInScreen(
                createViewModel: () => SignInViewModel(session),
                initialEmail: result?.email ?? '',
                message: result?.message ?? session.signedOutMessage,
              );
            },
          ),
        ],
      ),
      ShellRoute(
        pageBuilder: (context, state, child) => NoTransitionPage<void>(
          key: state.pageKey,
          child: MainShell(
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
              child: ListenableBuilder(
                listenable: session,
                builder: (context, _) =>
                    HomeScreen(userName: session.user?.displayName ?? ''),
              ),
            ),
          ),
          GoRoute(
            path: AppRoutes.tables,
            name: AppRoutes.tablesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const TablesScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.marketplace,
            name: AppRoutes.marketplaceName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MarketplaceScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.messages,
            name: AppRoutes.messagesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MessagesScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: AppRoutes.profileName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: ListenableBuilder(
                listenable: session,
                builder: (context, _) => ProfileScreen(
                  onSignOut: session.signOut,
                  busy: session.busy,
                  errorMessage: session.errorMessage,
                ),
              ),
            ),
          ),
        ],
      ),
    ],
  );
}
