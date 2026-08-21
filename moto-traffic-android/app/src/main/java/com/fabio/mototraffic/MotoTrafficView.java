package com.fabio.mototraffic;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Random;

public final class MotoTrafficView extends View {
    private enum Screen { HOME, GARAGE, CAREER, SEASON, PILOT, GAME, RESULT }
    private static final long FRAME = 16L;
    private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Handler loop = new Handler(Looper.getMainLooper());
    private final Random rng = new Random();
    private final GameSave save;
    private final ToneGenerator tone = new ToneGenerator(AudioManager.STREAM_MUSIC, 45);
    private final Vibrator vibrator;
    private Screen screen = Screen.HOME;
    private boolean running = true;
    private long lastFrame = System.nanoTime();
    private float W, H, d;
    private int garageBike = 0;
    private int careerPage = 0;
    private int selectedStage = -1;
    private int resultScore, resultCoins;

    private float playerX, playerY, speed, health, nitro, heat, distance, lanePhase;
    private float nitroTime, wheelieTime, crashCooldown, spawnTimer, coinTimer, eventTimer;
    private int score, runCoins, nearMisses, sessionMap;
    private String weather = "Limpo", event = "";
    private float eventRemaining = 0;
    private final List<Traffic> traffic = new ArrayList<>();
    private final List<Coin> coins = new ArrayList<>();
    private boolean bossActive;

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (!running) return;
            long now = System.nanoTime();
            float dt = Math.min(.033f, (now - lastFrame) / 1_000_000_000f);
            lastFrame = now;
            if (screen == Screen.GAME) updateGame(dt);
            invalidate();
            loop.postDelayed(this, FRAME);
        }
    };

    MotoTrafficView(Context context) {
        super(context);
        setLayerType(View.LAYER_TYPE_HARDWARE, null);
        save = new GameSave(context);
        vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        garageBike = save.selectedBike;
        stroke.setStyle(Paint.Style.STROKE);
        stroke.setStrokeWidth(3f);
        loop.post(tick);
    }

    void resume() { running = true; lastFrame = System.nanoTime(); loop.removeCallbacks(tick); loop.post(tick); }
    void pause() { running = false; loop.removeCallbacks(tick); save.save(); }

    @Override protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        W = w; H = h; d = getResources().getDisplayMetrics().density;
        playerX = W / 2f; playerY = H * .78f;
    }

    @Override protected void onDraw(Canvas c) {
        super.onDraw(c);
        switch (screen) {
            case HOME -> drawHome(c);
            case GARAGE -> drawGarage(c);
            case CAREER -> drawCareer(c);
            case SEASON -> drawSeason(c);
            case PILOT -> drawPilot(c);
            case GAME -> drawGame(c);
            case RESULT -> drawResult(c);
        }
    }

    private void bg(Canvas c) {
        c.drawColor(Color.rgb(7, 11, 18));
        p.setColor(Color.rgb(16, 24, 36));
        for (int i = 0; i < 9; i++) c.drawCircle((i * 137f) % W, (i * 223f) % H, 70f + (i % 3) * 25, p);
    }

    private void title(Canvas c, String a, String b) {
        text(c, a, 34, 28, 60, Color.WHITE, true, Paint.Align.LEFT);
        text(c, b, 15, 29, 88, Color.rgb(255,176,0), true, Paint.Align.LEFT);
    }

    private void topStats(Canvas c) {
        pill(c, W - 195, 26, W - 112, 61, "◈ " + save.coins, Color.rgb(255,176,0));
        pill(c, W - 105, 26, W - 23, 61, "LV " + save.level(), Color.rgb(88,184,255));
    }

    private void drawHome(Canvas c) {
        bg(c); title(c, "MOTO", "TRAFFIC · ASPHALT STORM"); topStats(c);
        if (save.premium) pill(c, 28, 107, 145, 141, "PREMIUM ON", Color.rgb(166,104,255));
        text(c, "PILOTO", 13, 29, 188, Color.LTGRAY, true, Paint.Align.LEFT);
        text(c, GameData.BIKES[save.selectedBike], 30, 29, 225, Color.WHITE, true, Paint.Align.LEFT);
        drawBike(c, W * .5f, H * .34f, 1.45f, save.selectedBike, false);

        float y = H * .49f;
        bigButton(c, 28, y, W - 28, y + 72, "CORRIDA RÁPIDA", "Trânsito infinito · " + GameData.MAPS[(save.totalRuns) % 4], Color.rgb(255,176,0));
        y += 85;
        twoButtons(c, y, "CARREIRA", save.totalStars() + "/36 ★", "GARAGEM", "7 motos · upgrades");
        y += 78;
        twoButtons(c, y, "TEMPORADA", "S1 · " + save.seasonPoints + " SP", "PILOTO", "stats · ranking");

        String[] daily = save.dailyChallenges();
        float dy = Math.min(H - 150, y + 100);
        text(c, "DESAFIOS DIÁRIOS", 13, 29, dy, Color.rgb(255,176,0), true, Paint.Align.LEFT);
        for (int i = 0; i < 3; i++) text(c, "• " + daily[i], 13, 29, dy + 25 + i * 22, Color.LTGRAY, false, Paint.Align.LEFT);
        text(c, "v1.7 Android · build 8", 11, W - 24, H - 20, Color.GRAY, false, Paint.Align.RIGHT);
    }

    private void drawGarage(Canvas c) {
        bg(c); title(c, "GARAGEM", "MOTOS · PERFORMANCE · TRIMS"); topStats(c);
        int b = garageBike;
        drawBike(c, W/2f, H*.28f, 1.8f, b, false);
        text(c, GameData.BIKES[b], 30, W/2f, H*.43f, Color.WHITE, true, Paint.Align.CENTER);
        text(c, save.unlocked[b] ? (save.selectedBike == b ? "SELECIONADA" : "DESBLOQUEADA") : (GameData.BIKE_COST[b] + " ◈"), 14, W/2f, H*.465f, save.unlocked[b] ? Color.rgb(93,225,147) : Color.rgb(255,176,0), true, Paint.Align.CENTER);
        pill(c, 24, H*.30f, 71, H*.36f, "‹", Color.WHITE);
        pill(c, W-71, H*.30f, W-24, H*.36f, "›", Color.WHITE);

        String[] labels = {"MOTOR", "AGILIDADE", "NITRO", "BLINDAGEM"};
        float y = H*.52f;
        for (int i=0;i<4;i++) {
            int lvl = save.upgrades[b][i];
            panel(c, 28, y, W-28, y+58, Color.rgb(16,24,36));
            text(c, labels[i], 14, 43, y+24, Color.WHITE, true, Paint.Align.LEFT);
            text(c, "LV " + lvl + "/5", 12, 43, y+44, Color.LTGRAY, false, Paint.Align.LEFT);
            String cost = lvl >= 5 ? "MAX" : save.upgradeCost(b,i) + " ◈";
            pill(c, W-142, y+11, W-42, y+47, cost, lvl>=5 ? Color.GRAY : Color.rgb(255,176,0));
            y += 67;
        }
        bigButton(c, 28, H-103, W-28, H-44, save.unlocked[b] ? "USAR MOTO" : "COMPRAR MOTO", "", save.unlocked[b] ? Color.rgb(93,225,147) : Color.rgb(255,176,0));
        back(c);
    }

    private void drawCareer(Canvas c) {
        bg(c); title(c, "CARREIRA", "12 ETAPAS · 36 ESTRELAS"); topStats(c);
        float y = 125;
        int start = careerPage * 6;
        for (int i = 0; i < 6; i++) {
            int s = start + i; if (s >= 12) break;
            boolean open = save.canPlayStage(s);
            panel(c, 24, y, W-24, y+74, open ? Color.rgb(16,24,36) : Color.rgb(12,15,20));
            text(c, String.format(Locale.US, "%02d", s+1), 24, 41, y+32, open ? Color.rgb(255,176,0) : Color.DKGRAY, true, Paint.Align.LEFT);
            text(c, GameData.CAREER[s], 17, 91, y+30, open ? Color.WHITE : Color.GRAY, true, Paint.Align.LEFT);
            text(c, GameData.MAPS[GameData.mapForStage(s)] + " · alvo " + GameData.targetForStage(s), 12, 91, y+52, Color.LTGRAY, false, Paint.Align.LEFT);
            text(c, stars(save.stars[s]), 17, W-42, y+41, save.stars[s]>0 ? Color.rgb(255,176,0) : Color.DKGRAY, true, Paint.Align.RIGHT);
            y += 84;
        }
        twoButtons(c, H-115, careerPage == 0 ? "PÁG. 1" : "← ANTERIOR", "", careerPage == 0 ? "SEGUINTE →" : "PÁG. 2", "");
        back(c);
    }

    private void drawSeason(Canvas c) {
        bg(c); title(c, "TEMPORADA 1", "ASPHALT STORM · 10 TIERS"); topStats(c);
        text(c, save.seasonPoints + " SP", 36, 28, 135, Color.WHITE, true, Paint.Align.LEFT);
        text(c, "Cada corrida aumenta Season Points", 13, 29, 160, Color.LTGRAY, false, Paint.Align.LEFT);
        float y = 195;
        for (int i=1;i<=10;i++) {
            int req = i * 75;
            boolean done = save.seasonPoints >= req;
            float x1 = 28 + ((i-1)%2) * (W/2f-18);
            float x2 = x1 + W/2f - 38;
            float yy = y + ((i-1)/2)*82;
            panel(c,x1,yy,x2,yy+65,done?Color.rgb(27,46,40):Color.rgb(16,24,36));
            text(c,"TIER " + i,15,x1+15,yy+27,Color.WHITE,true,Paint.Align.LEFT);
            text(c,req + " SP",11,x1+15,yy+48,done?Color.rgb(93,225,147):Color.GRAY,false,Paint.Align.LEFT);
            text(c,done?"✓":"◈",19,x2-16,yy+39,done?Color.rgb(93,225,147):Color.rgb(255,176,0),true,Paint.Align.RIGHT);
        }
        text(c, "Premium: +25% moedas · sem anúncios · CAFÉ 650 desbloqueada", 12, 28, H-72, Color.rgb(190,151,255), false, Paint.Align.LEFT);
        back(c);
    }

    private void drawPilot(Canvas c) {
        bg(c); title(c, "PILOTO", "ESTATÍSTICAS · LEADERBOARD LOCAL"); topStats(c);
        stat(c, 28, 130, "NÍVEL", String.valueOf(save.level()));
        stat(c, W/2+7, 130, "MELHOR SCORE", String.valueOf(save.bestScore));
        stat(c, 28, 225, "CORRIDAS", String.valueOf(save.totalRuns));
        stat(c, W/2+7, 225, "MOEDAS", String.valueOf(save.totalCoins));
        stat(c, 28, 320, "ESTRELAS", save.totalStars()+"/36");
        stat(c, W/2+7, 320, "SEASON", save.seasonPoints+" SP");
        text(c,"LEADERBOARD",15,28,440,Color.rgb(255,176,0),true,Paint.Align.LEFT);
        List<Integer> list = save.localLeaderboard();
        for(int i=0;i<list.size();i++) {
            panel(c,28,460+i*58,W-28,510+i*58,Color.rgb(16,24,36));
            text(c,(i+1)+".",18,43,492+i*58,Color.LTGRAY,true,Paint.Align.LEFT);
            text(c,i==0?"TU":"RIVAL "+i,15,79,491+i*58,Color.WHITE,true,Paint.Align.LEFT);
            text(c,String.valueOf(list.get(i)),16,W-44,491+i*58,Color.rgb(255,176,0),true,Paint.Align.RIGHT);
        }
        text(c,"Google Play Games pode ser ligado numa fase posterior.",12,28,H-74,Color.GRAY,false,Paint.Align.LEFT);
        back(c);
    }

    private void startGame(int stage) {
        selectedStage = stage;
        sessionMap = stage >= 0 ? GameData.mapForStage(stage) : save.totalRuns % 4;
        playerX=W/2f; playerY=H*.78f; speed=82; health=100; nitro=100; heat=0; distance=0; lanePhase=0;
        nitroTime=wheelieTime=crashCooldown=0; spawnTimer=.7f; coinTimer=.9f; eventTimer=10+rng.nextFloat()*8;
        score=runCoins=nearMisses=0; traffic.clear(); coins.clear(); bossActive=false; event=""; eventRemaining=0;
        weather = switch (sessionMap) { case 1 -> rng.nextBoolean()?"Limpo":"Nevoeiro"; case 2 -> rng.nextBoolean()?"Limpo":"Chuva"; case 3 -> "Noite"; default -> rng.nextInt(3)==0?"Chuva":"Limpo"; };
        screen=Screen.GAME;
        haptic(12);
    }

    private void updateGame(float dt) {
        if (health <= 0) { finishGame(); return; }
        float eng = 1f + save.upgrades[save.selectedBike][0]*.035f;
        float top = 205f * GameData.BIKE_SPEED[save.selectedBike] * eng;
        speed += (top - speed) * dt * .12f;
        if (nitroTime > 0) { nitroTime -= dt; speed = Math.min(top*1.24f, speed + 95*dt); nitro = Math.max(0,nitro-22*dt); }
        else nitro = Math.min(100, nitro + (3 + save.upgrades[save.selectedBike][2]) * dt);
        if (wheelieTime > 0) { wheelieTime -= dt; score += (int)(75*dt); }
        crashCooldown = Math.max(0, crashCooldown-dt);
        distance += speed * dt / 3600f;
        score += (int)(speed * dt * (1f + heat/220f) * (event.equals("Speed Zone")?1.8f:1f));
        lanePhase = (lanePhase + speed*dt*1.5f) % 120;
        if (speed > 155) heat = Math.min(100, heat + (speed-150)*.0045f*dt*60); else heat = Math.max(0,heat-2.0f*dt);

        eventTimer -= dt;
        if (eventTimer <= 0 && eventRemaining<=0) {
            event = GameData.EVENTS[rng.nextInt(GameData.EVENTS.length)]; eventRemaining=7.5f; eventTimer=20+rng.nextFloat()*13;
            tone.startTone(ToneGenerator.TONE_PROP_BEEP, 90);
        }
        if (eventRemaining>0) { eventRemaining-=dt; if(eventRemaining<=0) event=""; }
        if (heat >= 92 && !bossActive) { bossActive=true; spawnBoss(); }

        spawnTimer -= dt;
        float density = event.equals("Obras") ? .52f : Math.max(.38f, .9f - speed/420f);
        if (spawnTimer <= 0) { spawnTraffic(); spawnTimer = density + rng.nextFloat()*.45f; }
        coinTimer -= dt;
        if (coinTimer <= 0) { spawnCoin(); coinTimer = event.equals("Coin Rush") ? .22f : .75f + rng.nextFloat()*.9f; }

        Iterator<Traffic> it = traffic.iterator();
        while(it.hasNext()) {
            Traffic t=it.next();
            float rel=(speed - t.speed + 90) * 3.1f;
            t.y += rel*dt;
            if (t.police && heat>20) t.x += Math.signum(playerX-t.x)*38*dt;
            if (t.boss) t.x += Math.signum(playerX-t.x)*63*dt;
            float dx=Math.abs(t.x-playerX), dy=Math.abs(t.y-playerY);
            if (dx<45 && dy<70 && crashCooldown<=0) {
                float armor = GameData.BIKE_ARMOR[save.selectedBike] * (1f + save.upgrades[save.selectedBike][3]*.08f);
                health -= (t.boss?45:31)/armor; speed*=.62f; crashCooldown=1.0f; heat=Math.min(100,heat+14); haptic(45); tone.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD,110);
                t.y += 125;
            } else if (!t.passed && t.y>playerY+72 && dx<93) {
                t.passed=true; nearMisses++; score += 175 + (int)heat*2; heat=Math.min(100,heat+3.5f);
                haptic(8);
            }
            if (t.y>H+180) it.remove();
        }
        Iterator<Coin> ci=coins.iterator();
        while(ci.hasNext()) {
            Coin co=ci.next(); co.y += (speed+70)*3.0f*dt;
            if (Math.abs(co.x-playerX)<42 && Math.abs(co.y-playerY)<58) { runCoins++; score+=75; ci.remove(); tone.startTone(ToneGenerator.TONE_PROP_ACK,45); }
            else if (co.y>H+60) ci.remove();
        }
    }

    private void finishGame() {
        resultScore=score; resultCoins=runCoins;
        save.completeRun(score,runCoins,selectedStage,health,distance);
        screen=Screen.RESULT; traffic.clear(); coins.clear();
    }

    private void spawnTraffic() {
        float roadL=W*.12f, roadR=W*.88f;
        float laneW=(roadR-roadL)/3f;
        int lane=rng.nextInt(3);
        Traffic t=new Traffic(); t.x=roadL+laneW*(lane+.5f); t.y=-120; t.speed=40+rng.nextFloat()*90;
        t.type=rng.nextInt(4); t.police=heat>55 && rng.nextInt(6)==0; traffic.add(t);
        if (event.equals("Bloqueio") && rng.nextInt(3)==0) {
            Traffic b=new Traffic(); b.x=roadL+laneW*(rng.nextInt(3)+.5f); b.y=-220; b.speed=0; b.type=3; traffic.add(b);
        }
    }
    private void spawnBoss(){ Traffic t=new Traffic(); t.x=W*.5f; t.y=-180; t.speed=150; t.boss=true; t.police=true; traffic.add(t); }
    private void spawnCoin(){ float roadL=W*.12f,roadR=W*.88f,laneW=(roadR-roadL)/3f; Coin co=new Coin(); co.x=roadL+laneW*(rng.nextInt(3)+.5f); co.y=-40; coins.add(co); }

    private void drawGame(Canvas c) {
        drawRoad(c);
        for(Coin co:coins) drawCoin(c,co);
        for(Traffic t:traffic) drawTraffic(c,t);
        drawBike(c,playerX,playerY,wheelieTime>0?1.12f:1f,save.selectedBike,wheelieTime>0);
        drawHud(c);
        if (eventRemaining>0) {
            panel(c,W*.20f,96,W*.80f,142,Color.argb(220,18,24,32));
            text(c,event.toUpperCase(Locale.ROOT),18,W/2f,126,Color.rgb(255,176,0),true,Paint.Align.CENTER);
        }
        if (bossActive) text(c,"BLACK VIPER",16,W/2f,170,Color.rgb(255,68,76),true,Paint.Align.CENTER);
        if(weather.equals("Chuva")) drawRain(c);
        if(weather.equals("Nevoeiro")) { p.setColor(Color.argb(62,220,230,235)); c.drawRect(0,0,W,H,p); }
        if(sessionMap==3 || event.equals("Blackout")) { p.setColor(Color.argb(event.equals("Blackout")?115:70,0,0,10)); c.drawRect(0,0,W,H,p); }
    }

    private void drawRoad(Canvas c) {
        int sky = switch(sessionMap){case 1->Color.rgb(38,89,111);case 2->Color.rgb(33,63,43);case 3->Color.rgb(5,7,15);default->Color.rgb(42,56,72);};
        c.drawColor(sky); p.setColor(sessionMap==1?Color.rgb(205,177,103):Color.rgb(32,71,40)); c.drawRect(0,H*.1f,W,H,p);
        float l=W*.12f,r=W*.88f; p.setColor(Color.rgb(45,47,51)); c.drawRect(l,0,r,H,p);
        p.setColor(Color.rgb(240,240,230)); c.drawRect(l-5,0,l+5,H,p); c.drawRect(r-5,0,r+5,H,p);
        float lane=(r-l)/3f; p.setColor(Color.argb(175,245,245,225));
        for(int k=1;k<3;k++) for(float y=-120+lanePhase;y<H;y+=120) c.drawRoundRect(l+lane*k-3,y,l+lane*k+3,y+54,3,3,p);
    }

    private void drawHud(Canvas c) {
        panel(c,14,14,W-14,87,Color.argb(205,7,11,18));
        text(c,Math.round(speed)+"",28,27,49,Color.WHITE,true,Paint.Align.LEFT); text(c,"KM/H",10,29,68,Color.GRAY,true,Paint.Align.LEFT);
        text(c,String.valueOf(score),22,W/2f,49,Color.rgb(255,176,0),true,Paint.Align.CENTER); text(c,String.format(Locale.US,"%.2f KM",distance),10,W/2f,68,Color.GRAY,true,Paint.Align.CENTER);
        text(c,"HP "+Math.max(0,Math.round(health)),12,W-28,38,health<35?Color.RED:Color.WHITE,true,Paint.Align.RIGHT);
        text(c,"HEAT "+Math.round(heat)+"%",12,W-28,61,heat>70?Color.rgb(255,68,76):Color.LTGRAY,true,Paint.Align.RIGHT);
        text(c,weather+" · "+GameData.MAPS[sessionMap],10,W-28,78,Color.GRAY,false,Paint.Align.RIGHT);
        pill(c,W-122,H-118,W-18,H-67,"NITRO",nitro>10?Color.rgb(68,181,255):Color.DKGRAY);
        pill(c,W-122,H-59,W-18,H-16,"WHEELIE",Color.rgb(255,176,0));
        panel(c,18,H-67,118,H-17,Color.argb(190,7,11,18));
        text(c,"◈ "+runCoins,15,31,H-37,Color.rgb(255,176,0),true,Paint.Align.LEFT);
        text(c,"NEAR "+nearMisses,11,31,H-20,Color.GRAY,false,Paint.Align.LEFT);
    }

    private void drawTraffic(Canvas c, Traffic t) {
        int col=t.boss?Color.rgb(8,8,10):(t.police?Color.rgb(30,45,70):switch(t.type){case 0->Color.rgb(210,52,62);case 1->Color.rgb(80,146,211);case 2->Color.rgb(223,218,206);default->Color.rgb(112,117,126);});
        p.setColor(Color.argb(70,0,0,0)); c.drawRoundRect(t.x-38,t.y-62,t.x+38,t.y+67,15,15,p);
        p.setColor(col); c.drawRoundRect(t.x-34,t.y-60,t.x+34,t.y+60,14,14,p);
        p.setColor(Color.rgb(142,192,210)); c.drawRoundRect(t.x-26,t.y-35,t.x+26,t.y-4,8,8,p);
        p.setColor(Color.rgb(35,39,45)); c.drawRoundRect(t.x-27,t.y+10,t.x+27,t.y+38,7,7,p);
        if(t.police){p.setColor(t.boss?Color.rgb(255,28,41):Color.rgb(54,151,255));c.drawRect(t.x-24,t.y-3,t.x+24,t.y+4,p);}
    }

    private void drawCoin(Canvas c,Coin co){p.setColor(Color.rgb(255,183,0));c.drawCircle(co.x,co.y,15,p);p.setColor(Color.rgb(255,225,117));c.drawCircle(co.x,co.y,8,p);}

    private void drawBike(Canvas c,float x,float y,float scale,int bike,boolean wheelie) {
        c.save(); c.translate(x,y); c.scale(scale,scale); if(wheelie)c.rotate(-7);
        int[] cols={Color.rgb(255,176,0),Color.rgb(220,48,58),Color.rgb(42,130,208),Color.rgb(96,219,151),Color.rgb(178,73,255),Color.rgb(223,222,213),Color.rgb(56,215,229)};
        p.setColor(Color.argb(80,0,0,0));c.drawOval(-28,40,28,70,p);
        p.setColor(Color.rgb(20,22,26));c.drawOval(-24,-58,24,-22,p);c.drawOval(-25,27,25,68,p);
        p.setColor(cols[bike]); Path body=new Path();body.moveTo(0,-54);body.lineTo(25,-12);body.lineTo(19,42);body.lineTo(0,55);body.lineTo(-19,42);body.lineTo(-25,-12);body.close();c.drawPath(body,p);
        p.setColor(Color.rgb(198,233,244));Path glass=new Path();glass.moveTo(0,-42);glass.lineTo(14,-11);glass.lineTo(-14,-11);glass.close();c.drawPath(glass,p);
        p.setColor(Color.WHITE);c.drawCircle(0,-33,5,p);c.restore();
    }

    private void drawRain(Canvas c){p.setColor(Color.argb(80,190,220,255));p.setStrokeWidth(2);for(int i=0;i<45;i++){float x=(i*83+lanePhase*2)%W,y=(i*127+lanePhase*4)%H;c.drawLine(x,y,x-10,y+25,p);}}

    private void drawResult(Canvas c) {
        bg(c); title(c, health<=0?"CORRIDA TERMINADA":"RESULTADO", selectedStage>=0?GameData.CAREER[selectedStage]:"CORRIDA RÁPIDA");
        text(c,String.valueOf(resultScore),54,W/2,H*.27f,Color.WHITE,true,Paint.Align.CENTER); text(c,"SCORE",12,W/2,H*.31f,Color.GRAY,true,Paint.Align.CENTER);
        stat(c,28,H*.37f,"MOEDAS","+"+resultCoins+(save.premium?" +25%":""));
        stat(c,W/2+7,H*.37f,"NEAR MISSES",String.valueOf(nearMisses));
        stat(c,28,H*.49f,"DISTÂNCIA",String.format(Locale.US,"%.2f km",distance));
        stat(c,W/2+7,H*.49f,"HEAT MÁX.",Math.round(heat)+"%");
        if(selectedStage>=0) text(c,stars(save.stars[selectedStage]),34,W/2,H*.64f,Color.rgb(255,176,0),true,Paint.Align.CENTER);
        bigButton(c,28,H*.72f,W-28,H*.72f+68,"JOGAR DE NOVO","",Color.rgb(255,176,0));
        bigButton(c,28,H*.72f+82,W-28,H*.72f+143,"MENU PRINCIPAL","",Color.rgb(45,59,75));
    }

    @Override public boolean onTouchEvent(MotionEvent e) {
        if(e.getAction()==MotionEvent.ACTION_DOWN)return true;
        if(e.getAction()==MotionEvent.ACTION_MOVE && screen==Screen.GAME){
            float roadL=W*.12f+30,roadR=W*.88f-30; playerX=Math.max(roadL,Math.min(roadR,e.getX())); return true;
        }
        if(e.getAction()!=MotionEvent.ACTION_UP)return true;
        float x=e.getX(),y=e.getY();
        if(screen!=Screen.HOME && screen!=Screen.GAME && y<100 && x<120){screen=Screen.HOME;haptic(8);return true;}
        switch(screen){
            case HOME -> homeTouch(x,y);
            case GARAGE -> garageTouch(x,y);
            case CAREER -> careerTouch(x,y);
            case SEASON, PILOT -> { }
            case GAME -> gameTouch(x,y);
            case RESULT -> resultTouch(x,y);
        }
        return true;
    }

    private void homeTouch(float x,float y){
        float by=H*.49f;
        if(y>=by&&y<=by+72){startGame(-1);return;}
        if(y>=by+85&&y<=by+150){screen=x<W/2?Screen.CAREER:Screen.GARAGE;haptic(8);return;}
        if(y>=by+163&&y<=by+228){screen=x<W/2?Screen.SEASON:Screen.PILOT;haptic(8);}
    }

    private void garageTouch(float x,float y){
        if(y>H*.28f&&y<H*.39f){ if(x<W*.25f)garageBike=(garageBike+6)%7; else if(x>W*.75f)garageBike=(garageBike+1)%7; haptic(8); return; }
        float uy=H*.52f;
        for(int i=0;i<4;i++){float yy=uy+i*67;if(y>=yy&&y<=yy+58&&x>W-160){if(save.unlocked[garageBike]){boolean ok=save.upgrade(garageBike,i);tone.startTone(ok?ToneGenerator.TONE_PROP_ACK:ToneGenerator.TONE_PROP_NACK,70);}return;}}
        if(y>H-120){boolean ok=save.buyBike(garageBike);tone.startTone(ok?ToneGenerator.TONE_PROP_ACK:ToneGenerator.TONE_PROP_NACK,80);}
    }

    private void careerTouch(float x,float y){
        float yy=125;
        for(int i=0;i<6;i++){int s=careerPage*6+i;if(s>=12)break;if(y>=yy&&y<=yy+74){if(save.canPlayStage(s))startGame(s);else tone.startTone(ToneGenerator.TONE_PROP_NACK,80);return;}yy+=84;}
        if(y>H-135){if(x<W/2){careerPage=Math.max(0,careerPage-1);}else{careerPage=Math.min(1,careerPage+1);}haptic(8);}
    }

    private void gameTouch(float x,float y){
        if(x>W-145&&y>H-135&&y<H-62){ if(nitro>8){nitroTime=1.7f+save.upgrades[save.selectedBike][2]*.13f;haptic(12);tone.startTone(ToneGenerator.TONE_PROP_BEEP2,90);} }
        else if(x>W-145&&y>H-66){wheelieTime=1.4f;haptic(10);}
        else {float roadL=W*.12f+30,roadR=W*.88f-30;playerX=Math.max(roadL,Math.min(roadR,x));}
    }

    private void resultTouch(float x,float y){
        if(y>=H*.72f&&y<=H*.72f+72){startGame(selectedStage);}
        else if(y>=H*.72f+75){screen=Screen.HOME;}
    }

    private void back(Canvas c){ pill(c,18,22,92,59,"← MENU",Color.rgb(65,76,90)); }
    private void twoButtons(Canvas c,float y,String l1,String s1,String l2,String s2){float gap=10,x1=28,x2=W/2+gap/2,w=(W-56-gap)/2;smallButton(c,x1,y,x1+w,y+65,l1,s1);smallButton(c,x2,y,x2+w,y+65,l2,s2);}
    private void smallButton(Canvas c,float x1,float y1,float x2,float y2,String a,String b){panel(c,x1,y1,x2,y2,Color.rgb(19,29,42));text(c,a,16,x1+14,y1+27,Color.WHITE,true,Paint.Align.LEFT);if(!b.isEmpty())text(c,b,11,x1+14,y1+49,Color.GRAY,false,Paint.Align.LEFT);}
    private void bigButton(Canvas c,float x1,float y1,float x2,float y2,String a,String b,int color){p.setColor(color);c.drawRoundRect(x1,y1,x2,y2,18,18,p);int tc=(color==Color.rgb(255,176,0)||color==Color.rgb(93,225,147))?Color.rgb(15,17,20):Color.WHITE;text(c,a,19,x1+19,y1+(b.isEmpty()?39:31),tc,true,Paint.Align.LEFT);if(!b.isEmpty())text(c,b,11,x1+19,y1+52,tc,false,Paint.Align.LEFT);}
    private void panel(Canvas c,float x1,float y1,float x2,float y2,int color){p.setColor(color);c.drawRoundRect(x1,y1,x2,y2,16,16,p);}
    private void pill(Canvas c,float x1,float y1,float x2,float y2,String s,int color){p.setColor(Color.argb(225,20,27,36));c.drawRoundRect(x1,y1,x2,y2,(y2-y1)/2,(y2-y1)/2,p);stroke.setColor(color);stroke.setStrokeWidth(2f);c.drawRoundRect(x1,y1,x2,y2,(y2-y1)/2,(y2-y1)/2,stroke);text(c,s,11,(x1+x2)/2,(y1+y2)/2+4,color,true,Paint.Align.CENTER);}
    private void stat(Canvas c,float x,float y,String a,String b){float w=W/2-35;panel(c,x,y,x+w,y+78,Color.rgb(16,24,36));text(c,a,11,x+15,y+25,Color.GRAY,true,Paint.Align.LEFT);text(c,b,24,x+15,y+58,Color.WHITE,true,Paint.Align.LEFT);}
    private void text(Canvas c,String s,float size,float x,float y,int color,boolean bold,Paint.Align align){p.setColor(color);p.setTextSize(size*d);p.setTextAlign(align);p.setTypeface(bold?android.graphics.Typeface.DEFAULT_BOLD:android.graphics.Typeface.DEFAULT);c.drawText(s,x,y,p);}
    private String stars(int s){return (s>=1?"★":"☆")+(s>=2?"★":"☆")+(s>=3?"★":"☆");}
    private void haptic(long ms){performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);if(vibrator!=null&&vibrator.hasVibrator()){try{vibrator.vibrate(VibrationEffect.createOneShot(ms,VibrationEffect.DEFAULT_AMPLITUDE));}catch(Exception ignored){}}}

    private static final class Traffic {float x,y,speed;int type;boolean police,boss,passed;}
    private static final class Coin {float x,y;}
}
