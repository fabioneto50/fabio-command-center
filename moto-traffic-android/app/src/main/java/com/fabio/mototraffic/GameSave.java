package com.fabio.mototraffic;

import android.content.Context;
import android.content.SharedPreferences;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

final class GameSave {
    private final SharedPreferences p;
    int coins, xp, seasonPoints, selectedBike, bestScore, totalRuns, totalCoins;
    int[] stars = new int[12];
    int[][] upgrades = new int[7][4];
    boolean[] unlocked = new boolean[7];
    boolean premium;

    GameSave(Context context) {
        p = context.getSharedPreferences("moto_traffic_save_v2", Context.MODE_PRIVATE);
        load();
    }

    void load() {
        coins = p.getInt("coins", 12500);
        xp = p.getInt("xp", 0);
        seasonPoints = p.getInt("season", 0);
        selectedBike = p.getInt("bike", 0);
        bestScore = p.getInt("best", 0);
        totalRuns = p.getInt("runs", 0);
        totalCoins = p.getInt("totalCoins", 0);
        premium = p.getBoolean("premium", true);
        for (int i = 0; i < 7; i++) {
            unlocked[i] = p.getBoolean("unlocked_" + i, i == 0 || (premium && i == 5));
            for (int u = 0; u < 4; u++) upgrades[i][u] = p.getInt("up_" + i + "_" + u, 0);
        }
        for (int i = 0; i < 12; i++) stars[i] = p.getInt("stars_" + i, 0);
    }

    void save() {
        SharedPreferences.Editor e = p.edit()
                .putInt("coins", coins).putInt("xp", xp).putInt("season", seasonPoints)
                .putInt("bike", selectedBike).putInt("best", bestScore)
                .putInt("runs", totalRuns).putInt("totalCoins", totalCoins)
                .putBoolean("premium", premium);
        for (int i = 0; i < 7; i++) {
            e.putBoolean("unlocked_" + i, unlocked[i]);
            for (int u = 0; u < 4; u++) e.putInt("up_" + i + "_" + u, upgrades[i][u]);
        }
        for (int i = 0; i < 12; i++) e.putInt("stars_" + i, stars[i]);
        e.apply();
    }

    int level() { return Math.min(50, 1 + xp / 1500); }
    int levelProgress() { return xp % 1500; }

    int totalStars() {
        int s = 0; for (int v : stars) s += v; return s;
    }

    boolean canPlayStage(int stage) {
        if (stage == 0) return true;
        return stars[stage - 1] > 0;
    }

    boolean buyBike(int bike) {
        if (unlocked[bike]) { selectedBike = bike; save(); return true; }
        int cost = GameData.BIKE_COST[bike];
        if (coins >= cost) {
            coins -= cost; unlocked[bike] = true; selectedBike = bike; save(); return true;
        }
        return false;
    }

    boolean upgrade(int bike, int slot) {
        int lvl = upgrades[bike][slot];
        if (lvl >= 5) return false;
        int cost = 900 + lvl * 900 + slot * 250;
        if (coins < cost) return false;
        coins -= cost; upgrades[bike][slot]++; save(); return true;
    }

    int upgradeCost(int bike, int slot) {
        int lvl = upgrades[bike][slot];
        return lvl >= 5 ? 0 : 900 + lvl * 900 + slot * 250;
    }

    void completeRun(int score, int earnedCoins, int stage, float health, float distance) {
        int premiumCoins = premium ? Math.round(earnedCoins * .25f) : 0;
        coins += earnedCoins + premiumCoins;
        totalCoins += earnedCoins + premiumCoins;
        xp += Math.max(100, score / 16);
        seasonPoints += Math.max(5, score / 700);
        bestScore = Math.max(bestScore, score);
        totalRuns++;
        if (stage >= 0 && stage < 12) {
            int target = GameData.targetForStage(stage);
            int s = score >= target ? 1 : 0;
            if (score >= target * 1.35f) s = 2;
            if (score >= target * 1.7f && health > 0) s = 3;
            stars[stage] = Math.max(stars[stage], s);
        }
        save();
    }

    String dailyKey() { return LocalDate.now().toString(); }

    String[] dailyChallenges() {
        int seed = Math.abs(dailyKey().hashCode());
        return new String[] {
                "Percorre " + (4 + seed % 4) + " km numa corrida",
                "Apanha " + (10 + seed % 11) + " moedas",
                "Atinge Heat " + (65 + seed % 25) + "%"
        };
    }

    List<Integer> localLeaderboard() {
        List<Integer> r = new ArrayList<>();
        r.add(bestScore);
        r.add(Math.max(0, bestScore - 780));
        r.add(Math.max(0, bestScore - 1550));
        Collections.sort(r, Collections.reverseOrder());
        return r;
    }
}
