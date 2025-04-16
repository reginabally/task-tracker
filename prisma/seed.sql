-- Delete existing automation rules and tags if needed
DELETE FROM "AutomationRuleTag";
DELETE FROM "AutomationRule";

-- Find the task type IDs
SELECT @manual_review_id := (SELECT id FROM "TaskType" WHERE name = 'MANUAL_REVIEW_WORK');
SELECT @communication_id := (SELECT id FROM "TaskType" WHERE name = 'COMMUNICATION');

-- Find the tag IDs
SELECT @slack_ping_id := (SELECT id FROM "Tag" WHERE name = 'slack-ping');
SELECT @p2_discussion_id := (SELECT id FROM "Tag" WHERE name = 'p2-discussion');
SELECT @p2_post_id := (SELECT id FROM "Tag" WHERE name = 'p2-post');

-- Insert automation rules
INSERT INTO "AutomationRule" ("id", "trigger", "pattern", "typeId", "createdAt", "updatedAt")
VALUES 
  (1, 'link', 'https://a8c.slack.com/', @manual_review_id, datetime('now'), datetime('now')),
  (2, 'link', '#comment-', @communication_id, datetime('now'), datetime('now')),
  (3, 'link', 'wordpress.com', @communication_id, datetime('now'), datetime('now'));

-- Insert automation rule tags
INSERT INTO "AutomationRuleTag" ("ruleId", "tagId")
VALUES 
  (1, @slack_ping_id),
  (2, @p2_discussion_id),
  (3, @p2_post_id); 