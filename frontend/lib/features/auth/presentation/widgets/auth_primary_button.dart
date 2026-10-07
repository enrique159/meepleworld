import 'package:flutter/material.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';

class AuthPrimaryButton extends StatelessWidget {
  const AuthPrimaryButton({required this.label, this.onPressed, super.key});

  final String label;
  final VoidCallback? onPressed;

  static const _borderRadius = BorderRadius.all(Radius.circular(999));

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    enabled: onPressed != null,
    label: label,
    onTap: onPressed,
    excludeSemantics: true,
    child: Material(
      color: Colors.transparent,
      child: Ink(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [AppColors.authGradientStart, AppColors.authAccent],
          ),
          borderRadius: _borderRadius,
        ),
        child: InkWell(
          onTap: onPressed,
          borderRadius: _borderRadius,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 72),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Center(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'JekoSemiBold',
                    fontSize: 18,
                    height: 1.1,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
