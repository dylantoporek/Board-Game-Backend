class GameSerializer < ActiveModel::Serializer
  attributes :id, :player_avatar, :player_position, :cpu1_avatar, :cpu1_position, :cpu2_avatar, :cpu2_position, :cpu3_avatar, :cpu3_position
  has_one :user
end
