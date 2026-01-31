import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonTextarea, IonIcon, IonGrid, IonRow, IonCol, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { clipboardOutline } from 'ionicons/icons';
import ToggleLightDark from '../../components/utils/toggleLightDark';

interface Level {
    id: number;
    gridSize: number;
    positions: { [key: string]: 'start' | 'end' | 'objective' | null };
}

const defaultGridSize = 10;
const Builder: React.FC = () => {
    const [numLevels, setNumLevels] = useState<number>(1);
    const [levels, setLevels] = useState<Level[]>([{ id: 1, gridSize: defaultGridSize, positions: {} }]);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const history = useHistory();
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

    const setPositionType = (levelId: number, pos: string, type: 'start' | 'end' | 'objective' | null) => {
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
        const code = `const levels = ${JSON.stringify(cleanedLevels, null, 2)};`;
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Level Builder</IonTitle>
                    <IonButtons slot="start">
                        <IonMenuToggle />
                    </IonButtons>
                    <IonButtons slot="end">
                        <ToggleLightDark />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Level Builder</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid style={{ padding: '20px' }}>
                    <IonRow>
                        <IonCol size="12" sizeMd="8" offsetMd="2" sizeLg="6" offsetLg="3">
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
                                    {levels.map((level) => {
                                        const displaySize = Math.min(level.gridSize, 20);
                                        return (
                                            <div key={level.id}>
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
                                                <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${displaySize}, 1fr)`, gap: '0px', width: '300px', height: '300px', margin: '10px auto', backgroundColor: 'var(--glass-background)', padding: '5px', position: 'relative' }}>
                                                    {Array.from({ length: displaySize * displaySize }, (_, i) => {
                                                        const x = i % displaySize;
                                                        const y = Math.floor(i / displaySize);
                                                        const pos = `${x},${y}`;
                                                        const type = level.positions[pos];
                                                        let bgColor = '#555';
                                                        if (type === 'start') bgColor = 'rgba(255,0,0,0.5)';
                                                        else if (type === 'objective') bgColor = 'rgba(0,255,0,0.5)';
                                                        else if (type === 'end') bgColor = 'rgba(0,0,255,0.5)';
                                                        return (
                                                            <div
                                                                key={i}
                                                                style={{ backgroundColor: bgColor, border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    setSelected({ levelId: level.id, pos });
                                                                    if (gridRef.current) {
                                                                        const cellSize = 300 / displaySize;
                                                                        const menuX = x * cellSize + 5;
                                                                        const menuY = (y + 1) * cellSize + 5;
                                                                        setMenuPos({ x: menuX, y: menuY });
                                                                    }
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
                            <IonCol size="12" sizeMd="8" offsetMd="2" sizeLg="6" offsetLg="3">
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
                                            placeholder="Copy this code to use in Game.tsx"
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
