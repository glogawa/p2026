import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonTextarea, IonIcon, IonGrid, IonRow, IonCol, IonCardHeader, IonCardTitle } from '@ionic/react';
import { clipboardOutline, menuOutline } from 'ionicons/icons';
import PageHeader from '../../components/PageHeader';

interface Level {
    id: number;
    gridSize: number;
    positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
}

interface PlayerStats {
    stamina: number;
    agility: number;
}

interface NPCStats {
    stamina: number;
    staminaVariance: number;
    agility: { min: number; max: number };
}

interface GeneralSettings {
    fenceStaggerDurationMs: number;
    fenceBounceDistance: number;
    playerStats: PlayerStats;
    npcStats: NPCStats;
}

const defaultGridSize = 10;
const defaultGeneralSettings: GeneralSettings = {
    fenceStaggerDurationMs: 500,
    fenceBounceDistance: 0.2,
    playerStats: {
        stamina: 10,
        agility: 5,
    },
    npcStats: {
        stamina: 3,
        staminaVariance: 1,
        agility: { min: 0, max: 10 },
    },
};

const Builder: React.FC = () => {
    const [numLevels, setNumLevels] = useState<number>(1);
    const [levels, setLevels] = useState<Level[]>([{ id: 1, gridSize: defaultGridSize, positions: {} }]);
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [selected, setSelected] = useState<{ levelId: number; pos: string } | null>(null);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const handleNumLevelsChange = (value: string) => {
        const num = parseInt(value, 10) || 1;
        setNumLevels(num);
        const newLevels = Array.from({ length: num }, (_, i) => ({
            id: i + 1,
            gridSize: levels[i]?.gridSize || defaultGridSize,
            positions: levels[i]?.positions || {},
        }));
        setLevels(newLevels);
    };

    const handleGridSizeChange = (id: number, value: string) => {
        const size = parseInt(value, 10) || 20;
        setLevels(levels.map(level => level.id === id ? { ...level, gridSize: size } : level));
    };

    const setPositionType = (levelId: number, pos: string, type: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null) => {
        setLevels(levels.map(level =>
            level.id === levelId
                ? { ...level, positions: { ...level.positions, [pos]: type } }
                : level
        ));
    };

    const saveDesign = () => {
        const cleanedLevels = levels.map(level => ({
            ...level,
            positions: Object.fromEntries(Object.entries(level.positions).filter(([_, v]) => v !== null))
        }));
        const output = {
            general: generalSettings,
            locations: cleanedLevels,
        };
        const code = JSON.stringify(output, null, 2);
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
    };

    const calculateMenuPosition = (cellX: number, cellY: number, displaySize: number, gridSize: number, menuWidth: number = 120, menuHeight: number = 180) => {
        const cellSize = gridSize / displaySize;
        const gridLeft = 0;
        const gridTop = 0;
        const gridRight = gridSize;
        const gridBottom = gridSize;
        const padding = 10;

        let left = cellX * cellSize + 5;
        let top = (cellY + 1) * cellSize + 5;
        let align: 'left' | 'right' | 'bottom' | 'top' = 'left';

        // Check if menu would go off right edge
        if (left + menuWidth + padding > gridRight) {
            left = cellX * cellSize - menuWidth - 5;
            align = 'right';
        }

        // Check if menu would go off bottom edge
        if (top + menuHeight + padding > gridBottom) {
            top = cellY * cellSize - menuHeight - 5;
            align = 'top';
        }

        // Ensure menu doesn't go off left edge
        if (left < 0) {
            left = padding;
        }

        // Ensure menu doesn't go off top edge
        if (top < 0) {
            top = padding;
        }

        return { x: left, y: top, align };
    };

    return (
        <IonPage>
            <PageHeader title="Level Builder" />
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Level Builder</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid style={{ padding: '20px' }}>
                    <IonRow>
                        <IonCol size="12" sizeMd="12" sizeLg="12">
                            <IonCard className="glass-card">
                                <IonCardHeader>
                                    <IonCardTitle>Design Your Levels</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <IonItem>
                                        <IonLabel position="stacked">Number of Levels</IonLabel>
                                        <IonInput
                                            type="number"
                                            value={numLevels}
                                            onIonChange={(e) => handleNumLevelsChange(e.detail.value!)}
                                            min="1"
                                        />
                                    </IonItem>
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--ion-text-color)' }}>Fence Settings</h4>
                                        <IonItem>
                                            <IonLabel position="stacked">Stagger Duration (ms)</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.fenceStaggerDurationMs}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, fenceStaggerDurationMs: parseInt(e.detail.value!) || 500 })}
                                                min="100"
                                                max="2000"
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position="stacked">Bounce Distance</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.fenceBounceDistance}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, fenceBounceDistance: parseFloat(e.detail.value!) || 0.2 })}
                                                min="0.1"
                                                max="2"
                                                step="0.1"
                                            />
                                        </IonItem>
                                    </div>
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--ion-text-color)' }}>Player Stats</h4>
                                        <IonItem>
                                            <IonLabel position="stacked">Stamina</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.playerStats.stamina}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, playerStats: { ...generalSettings.playerStats, stamina: parseInt(e.detail.value!) || 10 } })}
                                                min="1"
                                                max="50"
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position="stacked">Agility</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.playerStats.agility}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, playerStats: { ...generalSettings.playerStats, agility: parseInt(e.detail.value!) || 5 } })}
                                                min="1"
                                                max="20"
                                            />
                                        </IonItem>
                                    </div>
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--ion-text-color)' }}>NPC Stats</h4>
                                        <IonItem>
                                            <IonLabel position="stacked">Base Stamina</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.npcStats.stamina}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, npcStats: { ...generalSettings.npcStats, stamina: parseInt(e.detail.value!) || 3 } })}
                                                min="1"
                                                max="50"
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position="stacked">Stamina Variance (±)</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.npcStats.staminaVariance}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, npcStats: { ...generalSettings.npcStats, staminaVariance: parseInt(e.detail.value!) || 1 } })}
                                                min="0"
                                                max="10"
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position="stacked">Agility Min</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.npcStats.agility.min}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, npcStats: { ...generalSettings.npcStats, agility: { ...generalSettings.npcStats.agility, min: parseInt(e.detail.value!) || 0 } } })}
                                                min="0"
                                                max="20"
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position="stacked">Agility Max</IonLabel>
                                            <IonInput
                                                type="number"
                                                value={generalSettings.npcStats.agility.max}
                                                onIonChange={(e) => setGeneralSettings({ ...generalSettings, npcStats: { ...generalSettings.npcStats, agility: { ...generalSettings.npcStats.agility, max: parseInt(e.detail.value!) || 10 } } })}
                                                min="0"
                                                max="20"
                                            />
                                        </IonItem>
                                    </div>
                                    {levels.map((level) => {
                                        const displaySize = level.gridSize;
                                        return (
                                            <div key={level.id} style={{ width: '100%', aspectRatio: 1, marginBottom: '20px' }}>
                                                <IonItem>
                                                    <IonLabel position="stacked">Level {level.id} Grid Size</IonLabel>
                                                    <IonInput
                                                        type="number"
                                                        value={level.gridSize}
                                                        onIonChange={(e) => handleGridSizeChange(level.id, e.detail.value!)}
                                                        min="5"
                                                        max="100"
                                                    />
                                                </IonItem>
                                                <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${displaySize}, 1fr)`, gap: '0px', width: '100%', height: '100%', margin: '0', backgroundColor: 'var(--glass-background)', padding: '5px', position: 'relative' }}>
                                                    {Array.from({ length: displaySize * displaySize }, (_, i) => {
                                                        const x = i % displaySize;
                                                        const y = Math.floor(i / displaySize);
                                                        const pos = `${x},${y}`;
                                                        const type = level.positions[pos];
                                                        let bgColor = '#555';
                                                        if (type === 'start') bgColor = 'rgba(255,0,0,0.5)';
                                                        else if (type === 'objective') bgColor = 'rgba(0,0,255,0.5)';
                                                        else if (type === 'end') bgColor = 'rgba(0,255,0,0.5)';
                                                        else if (type === 'fence') bgColor = 'rgb(0, 0, 0)';
                                                        else if (type === 'npc') bgColor = 'rgba(255,165,0,0.6)';
                                                        return (
                                                            <div
                                                                key={i}
                                                                style={{ backgroundColor: bgColor, border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setSelected({ levelId: level.id, pos });
                                                                    const menuPosition = calculateMenuPosition(x, y, displaySize, gridRef.current?.clientWidth || 300);
                                                                    setMenuPos({ x: menuPosition.x, y: menuPosition.y });
                                                                }}
                                                            ></div>
                                                        );
                                                    })}
                                                    {selected && selected.levelId === level.id && menuPos && (
                                                        <>
                                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'transparent', zIndex: 5 }} onClick={() => { setSelected(null); setMenuPos(null); }}></div>
                                                            <div style={{ position: 'absolute', left: menuPos.x, top: menuPos.y, backgroundColor: 'var(--glass-background)', border: '1px solid var(--glass-border)', padding: '5px', zIndex: 10, borderRadius: '5px' }} onClick={(e) => e.stopPropagation()}>
                                                                <div style={{ fontSize: '12px', marginBottom: '5px', color: 'var(--ion-text-color)' }}>Position: {selected.pos}</div>
                                                                <IonButtons style={{ flexDirection: 'column' }}>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, 'start'); setSelected(null); setMenuPos(null); }}>Start</IonButton>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, 'objective'); setSelected(null); setMenuPos(null); }}>Objective</IonButton>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, 'end'); setSelected(null); setMenuPos(null); }}>End</IonButton>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, 'fence'); setSelected(null); setMenuPos(null); }}>Fence</IonButton>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, 'npc'); setSelected(null); setMenuPos(null); }}>NPC</IonButton>
                                                                    <IonButton fill="clear" onClick={() => { setPositionType(level.id, selected.pos, null); setSelected(null); setMenuPos(null); }}>Clear</IonButton>
                                                                </IonButtons>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <IonButton className="glass-button" onClick={saveDesign} expand="block" style={{ marginTop: '20px' }}>
                                        Save Design
                                    </IonButton>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                    {generatedCode && (
                        <IonRow>
                            <IonCol size="12" sizeMd="12" sizeLg="12">
                                <IonCard className="glass-card">
                                    <IonCardHeader>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <IonCardTitle>Generated Code</IonCardTitle>
                                            <IonButton fill="clear" onClick={copyToClipboard}>
                                                <IonIcon icon={clipboardOutline} slot="start" />
                                                Copy
                                            </IonButton>
                                        </div>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonTextarea
                                            value={generatedCode}
                                            readonly
                                            rows={10}
                                            placeholder="Copy this JSON to use in Game.tsx"
                                        />
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    )}
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Builder;
