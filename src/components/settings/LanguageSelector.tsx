/**
 * LanguageSelector Component
 * 
 * Dropdown selector for changing app language in Settings.
 */

import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { Language } from "../../i18n/types";

export function LanguageSelector() {
    const { language, setLanguage, supportedLanguages } = useLanguage();
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-foreground">
                        {t("settings.language.title")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {t("settings.language.description")}
                    </p>
                </div>
                <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as Language)}
                >
                    <SelectTrigger className="w-40 h-9 border-primary/20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {supportedLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                <span className="flex items-center gap-2">
                                    <span>{lang.code === "en" ? "🇺🇸" : "🇪🇸"}</span>
                                    <span>{lang.nativeName}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
