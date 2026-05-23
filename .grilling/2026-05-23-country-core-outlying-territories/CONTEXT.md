> Working session artifact. Not canonical product documentation.
> Promote durable knowledge into tracked docs or ADRs deliberately.

# Geography Data

Geopoto's geography data context defines the geography learning concepts used by the app when teaching countries and related outlying areas.

## Language

**Country**:
A quiz entity representing a sovereign or app-included political geography item.
_Avoid_: Country shape, source geometry

**Country Core**:
The default quiz area highlighted for a **Country** in general country quizzes.
_Avoid_: Mainland, main land, sovereign territory

**Outlying Territory**:
A quiz entity associated with a **Country** but excluded from that country's **Country Core**.
_Avoid_: Extra territory, map unit, overseas shape

## Relationships

- A **Country** has exactly one **Country Core**.
- A **Country** may have zero or more **Outlying Territories**.
- **Country Core** boundaries are curated for general country quiz expectations instead of automatically matching every politically attached land shape.
- An **Outlying Territory** uses its own location for continent and regions instead of inheriting them from its **Country**.
- An **Outlying Territory** starts with only enough data to draw and identify it, and may receive more quiz fields later.
- France's **Country Core** includes metropolitan France and Corsica, while French Guiana, Martinique, Guadeloupe, Mayotte, and Réunion are **Outlying Territories**.
- The United States **Country Core** includes the contiguous United States and Alaska, while Hawaii, Puerto Rico, Guam, American Samoa, Northern Mariana Islands, and the U.S. Virgin Islands are **Outlying Territories**.
- Denmark's **Country Core** excludes Greenland and the Faroe Islands.
- The Netherlands **Country Core** excludes Caribbean Netherlands and other Kingdom-related Caribbean territories that Geopoto treats as Netherlands **Outlying Territories**.

## Example Dialogue

> **Dev:** "When the learner selects France, should every French overseas shape light up?"
> **Domain expert:** "No. France is the **Country** answer, and its **Country Core** is metropolitan France plus Corsica. French Guiana and Martinique are **Outlying Territories**."

## Flagged Ambiguities

- "main land" was used for the default area highlighted in country quizzes, but some expected areas are islands or non-contiguous regions. Resolved: use **Country Core**.
- "territory" was used for politically attached areas outside the default country quiz area. Resolved: use **Outlying Territory**.
- "country geometry" was used as if source geometry decides quiz boundaries. Resolved: **Country Core** and **Outlying Territory** boundaries are curated quiz decisions.
