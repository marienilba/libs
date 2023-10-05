import Translate from "@/libs/services/translate";
import fr from "./fr";
import en from "./en";

export const { t } = Translate([fr, en] as const);

const n = t("test.message");
