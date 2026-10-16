import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

/// Transición compartida por las vistas de autenticación completas.
class AuthTransitionPage extends CustomTransitionPage<void> {
  const AuthTransitionPage({
    required super.key,
    required super.child,
    required bool disableAnimations,
  }) : super(
         transitionDuration: disableAnimations
             ? Duration.zero
             : const Duration(milliseconds: 250),
         reverseTransitionDuration: disableAnimations
             ? Duration.zero
             : const Duration(milliseconds: 250),
         transitionsBuilder: _buildTransition,
       );

  static Widget _buildTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    if (MediaQuery.disableAnimationsOf(context)) return child;

    final curved = animation.drive(CurveTween(curve: Curves.easeInOutCubic));
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: curved.drive(
          Tween<Offset>(begin: const Offset(0.08, 0), end: Offset.zero),
        ),
        child: child,
      ),
    );
  }
}
