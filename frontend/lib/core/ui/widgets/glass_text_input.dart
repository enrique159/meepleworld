import 'package:flutter/material.dart';

import '../styles/app_colors.dart';
import 'glass_container.dart';

/// Campo de texto de vidrio; los errores quedan fuera de la cápsula.
class GlassTextInput extends StatelessWidget {
  const GlassTextInput({
    required this.controller,
    required this.placeholder,
    this.prependIcon,
    this.appendIcon,
    this.enabled = true,
    this.obscureText = false,
    this.autocorrect = true,
    this.enableSuggestions = true,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.autofillHints,
    this.validator,
    this.validationMessages = const [],
    this.onChanged,
    this.onSubmitted,
    super.key,
  });

  final TextEditingController controller;
  final String placeholder;
  final Widget? prependIcon;
  final Widget? appendIcon;
  final bool enabled;
  final bool obscureText;
  final bool autocorrect;
  final bool enableSuggestions;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final Iterable<String>? autofillHints;
  final FormFieldValidator<String>? validator;

  /// Mensajes posibles para reservar su espacio antes de validar.
  final List<String> validationMessages;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  static const _errorStyle = TextStyle(
    color: AppColors.inputError,
    fontFamily: 'JekoSemiBold',
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.2,
  );

  @override
  Widget build(BuildContext context) => FormField<String>(
    initialValue: controller.text,
    enabled: enabled,
    autovalidateMode: AutovalidateMode.onUserInteraction,
    // Leer el controlador también cubre cambios programáticos y autofill.
    validator: (_) => validator?.call(controller.text),
    builder: (field) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GlassContainer(
          borderRadius: BorderRadius.circular(999),
          borderStyle: null,
          backgroundColor: const Color.fromRGBO(255, 255, 255, 0.5),
          padding: EdgeInsets.only(
            left: 22,
            right: appendIcon == null ? 22 : 14,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 62),
            child: Row(
              children: [
                if (prependIcon != null) ...[
                  ExcludeSemantics(
                    child: IconTheme(
                      data: const IconThemeData(
                        color: AppColors.authAccent,
                        size: 24,
                      ),
                      child: prependIcon!,
                    ),
                  ),
                  const SizedBox(width: 18),
                ],
                Expanded(
                  child: Semantics(
                    label: placeholder,
                    child: TextField(
                      controller: controller,
                      enabled: enabled,
                      obscureText: obscureText,
                      autocorrect: autocorrect,
                      enableSuggestions: enableSuggestions,
                      keyboardType: keyboardType,
                      textInputAction: textInputAction,
                      textCapitalization: textCapitalization,
                      autofillHints: autofillHints,
                      style: const TextStyle(
                        fontFamily: 'JekoRegular',
                        fontSize: 16,
                        height: 1.2,
                      ),
                      decoration: InputDecoration(
                        hint: ExcludeSemantics(
                          child: Text(
                            placeholder,
                            maxLines: 2,
                            style: const TextStyle(
                              color: AppColors.inputPlaceholder,
                              fontFamily: 'JekoRegular',
                              fontSize: 16,
                              height: 1.2,
                            ),
                          ),
                        ),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 20,
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                      ),
                      onChanged: (value) {
                        field.didChange(value);
                        onChanged?.call(value);
                      },
                      onSubmitted: onSubmitted,
                    ),
                  ),
                ),
                ?appendIcon,
              ],
            ),
          ),
        ),
        if (validator != null)
          ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 28),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 6),
              child: Stack(
                children: [
                  const SizedBox.shrink(),
                  // Las medidas se conservan también con texto ampliado.
                  for (final message in validationMessages)
                    ExcludeSemantics(
                      child: Opacity(
                        opacity: 0,
                        child: Text(message, style: _errorStyle),
                      ),
                    ),
                  if (field.errorText case final error?)
                    Semantics(
                      liveRegion: true,
                      child: Text(error, style: _errorStyle),
                    ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}
