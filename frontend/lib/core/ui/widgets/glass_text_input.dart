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
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

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
        if (field.errorText case final error?)
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 8, 22, 0),
            child: Semantics(
              liveRegion: true,
              child: Text(
                error,
                style: const TextStyle(fontFamily: 'JekoRegular', fontSize: 14),
              ),
            ),
          ),
      ],
    ),
  );
}
