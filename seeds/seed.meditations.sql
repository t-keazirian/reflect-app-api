-- do I need to add in the minutes or date, or since it's default it doesn't need to be seeded and will default?

TRUNCATE meditations;

INSERT INTO meditations (description, minutes, current_mood, notes, date)
('Happy Hopeful Excited', 5, 'happy', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsum voluptatum vitae atque animi nesciunt illo, eius harum. Libero at minus debitis modi id unde est commodi! Eligendi esse nisi accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit laudantium atque a distinctio, numquam incidunt nemo, neque nihil id tempora ad. Deleniti porro voluptates nulla itaque suscipit optio iure dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit.', now() - '10 days'::INTERVAL),
('Sad Anxious Confused', 5, 'sad', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsum voluptatum vitae atque animi nesciunt illo, eius harum. Libero at minus debitis modi id unde est commodi! Eligendi esse nisi accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit laudantium atque a distinctio, numquam incidunt nemo, neque nihil id tempora ad. Deleniti porro voluptates nulla itaque suscipit optio iure dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit.', now() - '9 days'::INTERVAL),
('Medium Unsure', 5, 'meh', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsum voluptatum vitae atque animi nesciunt illo, eius harum. Libero at minus debitis modi id unde est commodi! Eligendi esse nisi accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit laudantium atque a distinctio, numquam incidunt nemo, neque nihil id tempora ad. Deleniti porro voluptates nulla itaque suscipit optio iure dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit.', now() - '8 days'::INTERVAL),
('Energized Focused Inspired', 5, 'happy', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsum voluptatum vitae atque animi nesciunt illo, eius harum. Libero at minus debitis modi id unde est commodi! Eligendi esse nisi accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit laudantium atque a distinctio, numquam incidunt nemo, neque nihil id tempora ad. Deleniti porro voluptates nulla itaque suscipit optio iure dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit.', now() - '7 days'::INTERVAL),
('Sleep', 5, 'meh', 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsum voluptatum vitae atque animi nesciunt illo, eius harum. Libero at minus debitis modi id unde est commodi! Eligendi esse nisi accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit laudantium atque a distinctio, numquam incidunt nemo, neque nihil id tempora ad. Deleniti porro voluptates nulla itaque suscipit optio iure dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit.', now() - '6 days'::INTERVAL);