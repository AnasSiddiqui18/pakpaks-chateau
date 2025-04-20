import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from 'date-fns';
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import BreadcrumbsMenu from '../components/shared/BreadcrumbsMenu';
import { ItemTypeDictionary, ItemRarityDictionary } from '../data/Dictionaries';
import { ItemType, ItemRarity } from '../data/Types';
import { useCharacter } from "../hooks/useCharacter";
import { useCharacterLogsDropdownByCharacter } from "../hooks/useCharacterLog";
import { useMagicItem } from "../hooks/useMagicItem";

const MagicItemForm = () => {
    // Character & log id values fetched from URL params
    const { characterId, magicItemId } = useParams();
    // Character summary details
    const character = useCharacter(characterId!);
    // Character log abstracts
    const characterLogAbstracts = useCharacterLogsDropdownByCharacter(characterId!);
    // Magic item details
    const currentMagicItem = magicItemId ? useMagicItem(characterId!, magicItemId) : null;
    // Hook used to navigate programmatically
    const navigate = useNavigate();
    // Flag indicating if form is in view mode
    const isViewing = !(magicItemId == null || useLocation().pathname.includes("/edit"));
    // Array containing Magic Item Type and Rarity ids for Autocomplete fields
    const magicItemTypeArray = Array.from(ItemTypeDictionary.keys());
    const magicItemRarityArray = Array.from(ItemRarityDictionary.keys());
    // Default error message for required fields
    const requiredFieldErrorMessage = "This field is required.";

    // State object containing user-provided magic item info
    const [magicItem, setMagicItem] = useState({
        name: '' as string,
        flavorName: '' as string | null,
        type: null as ItemType | null,
        rarity: null as ItemRarity | null,
        isConsumable: false,
        requiresAttunement: false,
        description: '' as string | null,
        flavorDescription: '' as string | null,
        properties: '' as string | null,
        isEquipped: false,
        originLogId: null as string | null,
        lossLogId: null as string | null,
    });

    // State object containing error flags for fields requiring validation
    const [magicItemError, setMagicItemError] = useState({
        name: false,
        type: false,
        rarity: false,
        originLogId: false,
    });

    // State object containing loading flag for View/Edit scenarios
    const [isMagicItemLoading, setIsMagicItemLoading] = useState(true);

    // Objects containing character log abstracts dictionary and array for dropdowns
    const [characterLogIds, characterLogDictionary] = useMemo(() => {
        let result = characterLogAbstracts?.reduce((r, o) => {
            r.logIds.push(o.id);
            r.logDictionary.set(o.id, `${o.title} (${format(o.timestamp, "yyyy-MM-dd")})`);
            return r;
        }, { logIds: [] as string[], logDictionary: new Map() as Map<string,string> });
        
        return [result?.logIds, result?.logDictionary]
    }, [characterLogAbstracts]);

    // Helper function triggered when updating an Autocomplete field
    const handleMagicItemAutocompleteChange = (_: React.BaseSyntheticEvent, value: ItemType | ItemRarity | string | null, fieldName: string) => {
        setMagicItem({ ...magicItem, [fieldName]: value });
    };
    // Helper function triggered when updating a Checkbox field
    const handleMagicItemCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        setMagicItem({ ...magicItem, [fieldName]: event.target.checked });
    };
    // Helper function triggered when updating a text field
    const handleMagicItemTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
        setMagicItem({ ...magicItem, [fieldName]: event.target.value });
    };
    // Helper function triggered when validating a required field
    const handleRequiredFieldValidation = (fieldName: string) => {
        let dynamicKey = fieldName as keyof (typeof magicItem);
        setMagicItemError({ ...magicItemError, [fieldName]: (magicItem[dynamicKey] === null || magicItem[dynamicKey] === "") });
    };

    // Function that validates form before submitting
    const validateForm = () => {
        let errorsFound: any = {};

        if (magicItem.name === null || magicItem.name === "")
            errorsFound['name'] = true;
        if (magicItem.type === null)
            errorsFound['type'] = true;
        if (magicItem.rarity === null)
            errorsFound['rarity'] = true;
        if (magicItem.originLogId === null || magicItem.originLogId === "")
            errorsFound['originLogId'] = true;

        if (Object.keys(errorsFound).length === 0) {
            cookAndSubmitMagicItem();
        } else {
            setMagicItemError({...magicItemError, ...errorsFound});
        }
    };

    const cookAndSubmitMagicItem = () => {
        let rawMagicItem = {...magicItem};

        if (!rawMagicItem.flavorName) {
            rawMagicItem.flavorName = null;
        }
        if (!rawMagicItem.description) {
            rawMagicItem.description = null;
        }
        if (!rawMagicItem.flavorDescription) {
            rawMagicItem.flavorDescription = null;
        }
        if (!rawMagicItem.properties) {
            rawMagicItem.properties = null;
        }
        if (!rawMagicItem.lossLogId) {
            rawMagicItem.lossLogId = null;
        }

        axios.post(`/api/characters/${characterId}/magic-items/${magicItemId || 'create'}`, rawMagicItem).then(_ => {
            navigate(`/characters/${characterId}`);
        });
    };

    useEffect(() => {
        if (currentMagicItem) {
            setMagicItem({
                name: currentMagicItem.name,
                flavorName: currentMagicItem.flavorName === null ? '' : currentMagicItem.flavorName,
                type: currentMagicItem.type,
                rarity: currentMagicItem.rarity,
                isConsumable: currentMagicItem.isConsumable,
                requiresAttunement: currentMagicItem.requiresAttunement,
                description: currentMagicItem.description === null ? '' : currentMagicItem.description,
                flavorDescription: currentMagicItem.flavorDescription === null ? '' : currentMagicItem.flavorDescription,
                properties: currentMagicItem.properties === null ? '' : currentMagicItem.properties,
                isEquipped: currentMagicItem.isEquipped,
                originLogId: currentMagicItem.originLogId,
                lossLogId: currentMagicItem.lossLogId === null ? '' : currentMagicItem.lossLogId,
            });
            setIsMagicItemLoading(false);
        }
    }, [currentMagicItem]);

    return (
        <>
            { (character && characterLogIds && (!magicItemId || (magicItemId && !isMagicItemLoading))) ? (
                <Container maxWidth="md">
                    <BreadcrumbsMenu 
                        characterId={characterId}
                        characterName={character.name}
                        currentPageTitle={(magicItemId ? (isViewing ? "View" : "Edit") : "New") + " Magic Item"}
                    />
                    <Paper 
                        elevation={1}
                        sx={{
                            p: 3 
                        }}
                    >
                        <Grid 
                            container 
                            direction="row" 
                            justifyContent="center" 
                            rowSpacing={2}
                            columnSpacing={2}
                            sx={{
                                pb: 2,
                                pr: 4,
                                ml: "auto",
                                mr: "auto",

                            }}
                        >
                            <Grid item xs={12}>
                                <Typography variant="h3" component="h1" gutterBottom textAlign="center">
                                    {(magicItemId ? (isViewing ? "View" : "Edit") : "New") + " Magic Item"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    error={magicItemError.name}
                                    disabled={isViewing}
                                    required
                                    id="magic-item-name"
                                    label="Name"
                                    helperText={magicItemError.name ? requiredFieldErrorMessage : ''}
                                    onChange={e => handleMagicItemTextChange(e, "name")}
                                    onBlur={_ => handleRequiredFieldValidation("name")}
                                    value={magicItem.name}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    disabled={isViewing}
                                    id="magic-item-flavor-name"
                                    label="Flavor Name"
                                    onChange={e => handleMagicItemTextChange(e, "flavorName")}
                                    value={magicItem.flavorName}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Autocomplete 
                                    disabled={isViewing}
                                    id="magic-item-type"
                                    options={magicItemTypeArray}
                                    getOptionLabel={(o) => ItemTypeDictionary.get(o) || ''}
                                    onChange={(e, v) => handleMagicItemAutocompleteChange(e, v, "type")}
                                    onBlur={_ => handleRequiredFieldValidation("type")}
                                    value={magicItem.type}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            error={magicItemError.type} 
                                            required 
                                            label="Type" 
                                            helperText={magicItemError.type ? requiredFieldErrorMessage : ''}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Autocomplete 
                                    disabled={isViewing}
                                    id="magic-item-rarity"
                                    options={magicItemRarityArray}
                                    getOptionLabel={(o) => ItemRarityDictionary.get(o) || ''}
                                    onChange={(e, v) => handleMagicItemAutocompleteChange(e, v, "rarity")}
                                    onBlur={_ => handleRequiredFieldValidation("rarity")}
                                    value={magicItem.rarity}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            error={magicItemError.rarity} 
                                            required 
                                            label="Rarity" 
                                            helperText={magicItemError.rarity ? requiredFieldErrorMessage : ''}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item sm={6} xs={12}>
                                <FormControlLabel 
                                    label="Consumable"
                                    control={
                                        <Checkbox 
                                            disabled={isViewing}
                                            checked={magicItem.isConsumable}
                                            onChange={e => handleMagicItemCheckboxChange(e, "isConsumable")}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid item sm={6} xs={12}>
                                <FormControlLabel 
                                    label="Attunement"
                                    control={
                                        <Checkbox 
                                            disabled={isViewing}
                                            checked={magicItem.requiresAttunement}
                                            onChange={e => handleMagicItemCheckboxChange(e, "requiresAttunement")}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    disabled={isViewing}
                                    id="magic-item-description"
                                    label="Description"
                                    onChange={e => handleMagicItemTextChange(e, "description")}
                                    value={magicItem.description}
                                    multiline
                                    rows={6}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    disabled={isViewing}
                                    id="magic-item-flavor-description"
                                    label="Flavor Description"
                                    onChange={e => handleMagicItemTextChange(e, "flavorDescription")}
                                    value={magicItem.flavorDescription}
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    disabled={isViewing}
                                    id="magic-item-properties"
                                    label="Properties"
                                    onChange={e => handleMagicItemTextChange(e, "properties")}
                                    value={magicItem.properties}
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete 
                                    disabled={magicItemId != null}
                                    id="magic-item-origin-log"
                                    options={characterLogIds || []}
                                    getOptionLabel={(o) => characterLogDictionary?.get(o) || ''}
                                    onChange={(e, v) => handleMagicItemAutocompleteChange(e, v, "originLogId")}
                                    onBlur={_ => handleRequiredFieldValidation("originLogId")}
                                    value={magicItem.originLogId}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            error={magicItemError.originLogId} 
                                            required 
                                            label="Origin Log" 
                                            helperText={magicItemError.originLogId ? requiredFieldErrorMessage : ''}
                                        />
                                    )}
                                />
                            </Grid>
                            { !isViewing &&
                                <Grid justifyContent="flex-end" container item xs={12}>
                                    <Grid item md={1} xs={2}>
                                        <Button 
                                            variant="contained"
                                            onClick={_ => validateForm()}
                                            fullWidth
                                        >
                                            Save
                                        </Button>
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                    </Paper>
                </Container>
            ) : (
                <LinearProgress />
            )}
        </>
    );
};

export default MagicItemForm;