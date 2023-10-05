import Translate from "@/libs/services/translate";
import fr from "./fr";
import en from "./en";

export const { t } = Translate({ fr: fr, en: en });

const x = t("home");
