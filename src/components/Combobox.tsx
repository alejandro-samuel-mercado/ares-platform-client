'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    id: string | number;
    nombre: string;
    logo_url?: string | null;
    emoji?: string;
    subtext?: string;
}

interface ComboboxProps {
    options: Option[];
    value: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    label?: string;
    error?: boolean;
}

export default function Combobox({ options, value, onChange, placeholder = "Seleccionar...", label, error }: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value]);

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        const q = search.toLowerCase();
        return options.filter(o => 
            o.nombre.toLowerCase().includes(q) || 
            o.subtext?.toLowerCase().includes(q)
        );
    }, [options, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="combobox-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {label && <label className="input-label" style={{ fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>{label}</label>}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'var(--surface-base)',
                    border: error ? '2px solid var(--color-danger)' : '2px solid #000',
                    borderRadius: '16px',
                    padding: '0 1.25rem',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(var(--color-primary-rgb), 0.2)' : 'none',
                    transition: '0.2s',
                    position: 'relative',
                    zIndex: isOpen ? 101 : 1
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                    {selectedOption?.logo_url && (
                        <img src={selectedOption.logo_url} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    )}
                    {selectedOption?.emoji && <span style={{ fontSize: '1.2rem' }}>{selectedOption.emoji}</span>}
                    <span style={{ 
                        fontWeight: 700, 
                        color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    }}>
                        {selectedOption ? selectedOption.nombre : placeholder}
                    </span>
                </div>
                <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s', opacity: 0.5 }} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            background: 'var(--surface-raised)',
                            border: '3px solid #000',
                            borderRadius: '20px',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.4)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '400px'
                        }}
                    >
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                autoFocus
                                className="input"
                                placeholder="Buscar..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ 
                                    height: '44px', 
                                    paddingLeft: '3rem', 
                                    background: 'var(--surface-base)',
                                    fontSize: '0.9rem',
                                    boxShadow: 'none'
                                }}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }} className="custom-scroll">
                            {filteredOptions.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', fontWeight: 800 }}>
                                    SIN RESULTADOS
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <div
                                        key={option.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(option.id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        style={{
                                            padding: '1rem 1.25rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: option.id === value ? 'var(--color-primary)' : 'transparent',
                                            color: option.id === value ? 'white' : 'var(--text-primary)',
                                            transition: '0.2s',
                                            marginBottom: '2px'
                                        }}
                                        onMouseEnter={e => {
                                            if (option.id !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                        onMouseLeave={e => {
                                            if (option.id !== value) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {option.logo_url && (
                                                <img src={option.logo_url} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                            )}
                                            {option.emoji && <span style={{ fontSize: '1.2rem' }}>{option.emoji}</span>}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{option.nombre}</span>
                                                {option.subtext && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{option.subtext}</span>}
                                            </div>
                                        </div>
                                        {option.id === value && <Check size={18} />}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
