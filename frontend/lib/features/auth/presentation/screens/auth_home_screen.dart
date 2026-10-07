import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:meepleworld/app/router/app_routes.dart';
import 'package:meepleworld/core/ui/styles/glass_border_style.dart';
import 'package:meepleworld/core/ui/widgets/glass_button.dart';

import '../widgets/auth_primary_button.dart';

class AuthHomeScreen extends StatelessWidget {
  const AuthHomeScreen({super.key});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.end,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      AuthPrimaryButton(
        label: 'Crea tu cuenta',
        onPressed: () => context.push(AppRoutes.signUp),
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
