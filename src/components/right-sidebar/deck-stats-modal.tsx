"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Deck } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  getSpellPips,
  getSpellDamage,
  getSpellHealing,
  getSpellHealingOverTime,
  getSchoolIconPath
} from "@/lib/spell-utils";
import Image from "next/image";

interface DeckStatsModalProps {
  deck: Deck;
}

export default function DeckStatsModal({ deck }: DeckStatsModalProps) {
  // Calculate pip cost distribution
  const pipCostDistribution = () => {
    const distribution: Record<number, number> = {};
    const maxPips = 10; // Maximum pips to display

    // Initialize distribution with zeros
    for (let i = 1; i <= maxPips; i++) {
      distribution[i] = 0;
    }

    // Count spells by pip cost
    deck.spells.forEach((spell) => {
      const pips = getSpellPips(spell);
      if (pips <= maxPips) {
        distribution[pips] = (distribution[pips] || 0) + 1;
      } else {
        // Group all spells with pips > maxPips into the maxPips category
        distribution[maxPips] = (distribution[maxPips] || 0) + 1;
      }
    });

    // Convert to array format for chart
    return Object.entries(distribution).map(([pips, count]) => ({
      pips: pips === maxPips.toString() ? `${maxPips}+` : pips,
      count
    }));
  };

  // Calculate school distribution
  const schoolDistribution = () => {
    const distribution: Record<string, number> = {};

    // Count spells by school
    deck.spells.forEach((spell) => {
      const school = spell.school || "unknown";
      distribution[school] = (distribution[school] || 0) + 1;
    });

    // Convert to array format for chart
    return Object.entries(distribution).map(([school, count]) => ({
      school: school.charAt(0).toUpperCase() + school.slice(1),
      count,
      percentage: Math.round((count / deck.spells.length) * 100) || 0
    }));
  };

  // Calculate spell type distribution
  const spellTypeDistribution = () => {
    let damageCount = 0;
    let healingCount = 0;
    let utilityCount = 0;

    deck.spells.forEach((spell) => {
      if (getSpellDamage(spell) > 0) {
        damageCount++;
      } else if (
        getSpellHealing(spell) > 0 ||
        getSpellHealingOverTime(spell) > 0
      ) {
        healingCount++;
      } else {
        utilityCount++;
      }
    });

    return [
      { name: "Damage", value: damageCount },
      { name: "Healing", value: healingCount },
      { name: "Utility", value: utilityCount }
    ];
  };

  // Calculate average stats
  const calculateAverageStats = () => {
    if (deck.spells.length === 0) {
      return {
        avgPipCost: 0,
        avgDamage: 0,
        avgDPP: 0,
        totalDamage: 0,
        totalHealing: 0
      };
    }

    const totalPips = deck.spells.reduce(
      (sum, spell) => sum + getSpellPips(spell),
      0
    );
    const damageSpells = deck.spells.filter(
      (spell) => getSpellDamage(spell) > 0
    );
    const totalDamage = damageSpells.reduce(
      (sum, spell) => sum + getSpellDamage(spell),
      0
    );
    const totalHealing =
      deck.spells.reduce((sum, spell) => sum + getSpellHealing(spell), 0) +
      deck.spells.reduce(
        (sum, spell) => sum + getSpellHealingOverTime(spell),
        0
      );

    return {
      avgPipCost: Math.round((totalPips / deck.spells.length) * 10) / 10,
      avgDamage:
        damageSpells.length > 0
          ? Math.round(totalDamage / damageSpells.length)
          : 0,
      avgDPP:
        damageSpells.length > 0
          ? Math.round(
              (totalDamage /
                damageSpells.reduce(
                  (sum, spell) => sum + getSpellPips(spell),
                  0
                )) *
                10
            ) / 10
          : 0,
      totalDamage,
      totalHealing
    };
  };

  const pipDistData = pipCostDistribution();
  const schoolDistData = schoolDistribution();
  const spellTypeData = spellTypeDistribution();
  const averageStats = calculateAverageStats();

  // Colors for the school pie chart
  const schoolColors: Record<string, string> = {
    Fire: "#cc0000",
    Ice: "#0077cc",
    Storm: "#6600cc",
    Life: "#009900",
    Death: "#666666",
    Myth: "#cccc00",
    Balance: "#cc6600",
    Utility: "#9933ff"
  };

  // Colors for the spell type pie chart
  const spellTypeColors = ["#cc0000", "#009900", "#9933ff"];

  return (
    <div className="py-4">
      <Tabs defaultValue="distribution">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pip Cost Distribution</CardTitle>
              <CardDescription>Number of spells by pip cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipDistData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pips" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Pip Cost
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {label}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Count
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="rgba(147, 51, 234, 0.8)"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#888", fontSize: 12 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Spell Type Distribution</CardTitle>
              <CardDescription>
                Breakdown of spell types in your deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spellTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {spellTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={spellTypeColors[index % spellTypeColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Type
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {payload[0].name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Count
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>School Distribution</CardTitle>
              <CardDescription>
                Breakdown of schools in your deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={schoolDistData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {schoolDistData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            schoolColors[entry.school] ||
                            `hsl(${index * 45}, 70%, 50%)`
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    School
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {payload[0].payload.school}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Count
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {schoolDistData.map((school) => (
                  <div
                    key={school.school}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={getSchoolIconPath(school.school)}
                        alt={school.school}
                        width={20}
                        height={20}
                      />
                      <span>{school.school}</span>
                    </div>
                    <Badge variant="outline">
                      {school.count} ({school.percentage}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck Summary</CardTitle>
              <CardDescription>
                Overall statistics for your deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">General</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Total Cards
                      </dt>
                      <dd className="text-2xl font-bold">
                        {deck.spells.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Average Pip Cost
                      </dt>
                      <dd className="text-2xl font-bold">
                        {averageStats.avgPipCost}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Schools Used
                      </dt>
                      <dd className="text-2xl font-bold">
                        {schoolDistData.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Dominant School
                      </dt>
                      <dd className="text-2xl font-bold">
                        {schoolDistData.length > 0
                          ? schoolDistData.sort((a, b) => b.count - a.count)[0]
                              .school
                          : "None"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Damage</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Total Damage Potential
                      </dt>
                      <dd className="text-2xl font-bold">
                        {averageStats.totalDamage}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Average Damage
                      </dt>
                      <dd className="text-2xl font-bold">
                        {averageStats.avgDamage}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Damage Per Pip (DPP)
                      </dt>
                      <dd className="text-2xl font-bold">
                        {averageStats.avgDPP}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Damage Spells
                      </dt>
                      <dd className="text-2xl font-bold">
                        {spellTypeData[0].value}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Utility</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Total Healing Potential
                      </dt>
                      <dd className="text-2xl font-bold">
                        {averageStats.totalHealing}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Healing Spells
                      </dt>
                      <dd className="text-2xl font-bold">
                        {spellTypeData[1].value}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Utility Spells
                      </dt>
                      <dd className="text-2xl font-bold">
                        {spellTypeData[2].value}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Utility Ratio
                      </dt>
                      <dd className="text-2xl font-bold">
                        {deck.spells.length > 0
                          ? `${Math.round(
                              (spellTypeData[2].value / deck.spells.length) *
                                100
                            )}%`
                          : "0%"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
