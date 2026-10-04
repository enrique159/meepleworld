import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:meepleworld/core/ui/widgets/glass_button.dart';

/// Cabecera visual de Inicio; las acciones se conectarán con sus futuros flujos.
class HomeHeader extends StatelessWidget {
  const HomeHeader({
    this.city = 'La Paz',
    this.onCityPressed,
    this.onSearchPressed,
    this.onNotificationsPressed,
    super.key,
  });

  final String city;
  final VoidCallback? onCityPressed;
  final VoidCallback? onSearchPressed;
  final VoidCallback? onNotificationsPressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Align(
            alignment: Alignment.centerLeft,
            child: GlassButton(
              semanticLabel: 'Seleccionar ciudad, $city',
              onPressed: onCityPressed,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SvgPicture.asset(
                    'assets/custom/location_filled.svg',
                    width: 18,
                    height: 18,
                    excludeFromSemantics: true,
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      city,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'JekoSemiBold',
                        fontSize: 18,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        _iconButton(
          label: 'Buscar',
          icon: HugeIcons.strokeRoundedSearch01,
          onPressed: onSearchPressed,
        ),
        const SizedBox(width: 8),
        _iconButton(
          label: 'Notificaciones',
          icon: HugeIcons.strokeRoundedNotification01,
          onPressed: onNotificationsPressed,
        ),
      ],
    );
  }

  Widget _iconButton({
    required String label,
    required List<List<dynamic>> icon,
    required VoidCallback? onPressed,
  }) {
    return SizedBox.square(
      dimension: 56,
      child: GlassButton(
        semanticLabel: label,
        onPressed: onPressed,
        padding: EdgeInsets.zero,
        child: HugeIcon(icon: icon, size: 24, strokeWidth: 1.7),
      ),
    );
  }
}
