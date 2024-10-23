DELIMITER //
CREATE OR REPLACE PROCEDURE get_story_award
(award_id UUID, 
character_id UUID)
READS SQL DATA
BEGIN
    SELECT id, 
        name, 
        description, 
        status,
        characterId, 
        originLogId
    FROM storyAward
    WHERE id = award_id
    AND characterId = character_id;
END; //
DELIMITER ;