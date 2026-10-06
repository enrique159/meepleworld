import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:meepleworld/app/router/app_routes.dart';
import 'package:meepleworld/core/ui/styles/glass_border_style.dart';
import 'package:meepleworld/core/ui/widgets/glass_button.dart';

class AuthHomeScreen extends StatelessWidget {
  const AuthHomeScreen({super.key});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.end,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _GradientButton(
        onPressed: () => context.go(AppRoutes.signUp),
        child: const Text('Crea tu cuenta', style: _buttonTextStyle),
      ),
      const SizedBox(height: 18),
      SizedBox(
        width: double.infinity,
        child: GlassButton(
          semanticLabel: 'Ya tengo una cuenta. Iniciar sesión',
          onPressed: () => context.go(AppRoutes.signIn),
          height: 72,
          padding: EdgeInsets.zero,
          borderStyle: GlassBorderStyle.coloredBackground,
          child: const Text(
            'Ya tengo una cuenta',
            textAlign: TextAlign.center,
            style: _buttonTextStyle,
          ),
        ),
      ),
    ],
  );

  static const _buttonTextStyle = TextStyle(
    color: Colors.white,
    fontFamily: 'JekoSemiBold',
    fontSize: 18,
    height: 1.1,
  );
}

class _GradientButton extends StatelessWidget {
  const _GradientButton({required this.onPressed, required this.child});

  final VoidCallback onPressed;
  final Widget child;

  static const _borderRadius = BorderRadius.all(Radius.circular(999));

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    enabled: true,
    label: 'Crea tu cuenta',
    onTap: onPressed,
    excludeSemantics: true,
    child: SizedBox(
      height: 72,
      child: Material(
        color: Colors.transparent,
        child: Ink(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [Color(0xFF9D40E1), Color(0xFF5F4BD1)],
            ),
            borderRadius: _borderRadius,
          ),
          child: InkWell(
            onTap: onPressed,
            borderRadius: _borderRadius,
            child: Center(child: child),
          ),
        ),
      ),
    ),
  );
}
