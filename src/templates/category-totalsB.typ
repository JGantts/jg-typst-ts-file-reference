#import "conf.typ": conf

#set text(white, size: 12pt)
#set page(
  paper: "us-letter",
  header: align(left)[
    JGIS
  ],
  footer: align(left)[
    Just a Good Inventory System
],
  numbering: "1",
  fill: black,
)

#[
#set align(center)
#set text(24pt)
 Inventory for
 #v(-24pt)
= _Roadside Market_
2025/07/06
]

#set table(
  stroke: none,
  gutter: 0.2em,
  fill: (x, y) =>
    if x == 0 or y == 0 { gray },
  inset: (right: 1.5em),
)

#show table.cell: it => {
  if it.x == 0 or it.y == 0 {
    set text(white)
    strong(it)
  } else {
    it
  }
}

#table(
  columns: (1fr, auto, auto, auto),
  inset: 10pt,
  align: horizon,
  table.header(
    [*Category*], [*Total Value*], [*Markup*], [*Adjusted Total*]
  ),

  [Cigarettes], [\$41,335.78], [25.00%], [\$31,001.84],
  [Grocery], [\$16,260.61], [60.00%], [\$6,504.24],
  [Hba], [\$582.78], [60.00%], [\$233.11],
  [Novelty], [\$1,131.51], [65.00%], [\$396.03],
  [Tobacco], [\$6,061.50], [20.00%], [\$4,849.20],
  [Cigars], [\$2,190.60], [25.00%], [\$1,642.95],
  [Soda], [\$8,638.70], [60.00%], [\$3,455.48],
  [Automotive], [\$583.59], [65.00%], [\$204.26],
  [Beer], [\$16,133.64], [20.00%], [\$12,906.91],
  [Ecigs/Vape], [\$1,322.24], [50.00%], [\$661.12],
)