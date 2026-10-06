import 'package:flutter/material.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';
import 'package:meepleworld/core/ui/widgets/section_placeholder.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({
    required this.onSignOut,
    required this.busy,
    this.errorMessage,
    super.key,
  });

  final VoidCallback onSignOut;
  final bool busy;
  final String? errorMessage;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      const Expanded(child: SectionPlaceholder(title: 'Mi Perfil')),
      if (errorMessage case final message?)
        Padding(
          padding: const EdgeInsets.all(16),
          child: Semantics(liveRegion: true, child: Text(message)),
        ),
      Material(
        type: MaterialType.transparency,
        child: TextButton(
          style: TextButton.styleFrom(foregroundColor: AppColors.foreground),
          onPressed: busy ? null : onSignOut,
          child: Text(busy ? 'Comprobando sesión…' : 'Cerrar sesión'),
        ),
      ),
    ],
  );
}
