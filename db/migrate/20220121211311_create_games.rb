class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.string :player_avatar
      t.integer :player_position
      t.string :cpu1_avatar
      t.integer :cpu1_position
      t.string :cpu2_avatar
      t.integer :cpu2_position
      t.string :cpu3_avatar
      t.integer :cpu3_position
      t.belongs_to :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
