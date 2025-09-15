import { getLabelColor, getLightColor } from "@/utils/label_color";
import { EventKind } from "@sola/sdk";


export default function EventKindLabel({ kind }: { kind: EventKind }) {
    const color = getLabelColor(kind || undefined)
    const lightColor = getLightColor(color, 0.4)
    return kind ? <>
        <span style={{ color: lightColor }} className="capitalize">{kind}</span>
        <span className="capitalize mx-1">·</span>
    </> : null;
}