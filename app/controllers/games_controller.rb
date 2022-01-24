class GamesController < ApplicationController
    def index
        render json: Game.all
    end

    def create
        game = @current_user.games.create!(game_params)
        render json: game, status: :created
    end

    def show
        game = @current_user.games.find_by(id: params[:id])
        render json: game, status: :created
    end

    private

    def game_params
        params.permit(:player_avatar, :player_position, :cpu1_avatar, :cpu1_position, :cpu2_avatar, :cpu2_position, :cpu3_avatar, :cpu3_position)
    end
end
