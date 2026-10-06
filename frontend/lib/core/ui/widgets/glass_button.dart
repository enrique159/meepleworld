import 'package:flutter/widgets.dart';

import 'glass_container.dart';

/// Botón de cápsula que reutiliza la superficie de vidrio del menú inferior.
class GlassButton extends StatelessWidget {
  const GlassButton({
    required this.semanticLabel,
    required this.child,
    this.onPressed,
    this.height = 56,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
    super.key,
  });

  final String semanticLabel;
  final Widget child;
  final VoidCallback? onPressed;
  final double height;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: onPressed != null,
      label: semanticLabel,
      onTap: onPressed,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: onPressed,
        child: GlassContainer(
          borderRadius: BorderRadius.circular(999),
          padding: padding,
          child: SizedBox(
            height: height,
            child: Center(widthFactor: 1, child: child),
          ),
        ),
      ),
    );
  }
}
